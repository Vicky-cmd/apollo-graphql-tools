import jsonpath, { PathComponent } from 'jsonpath'
import _ from 'lodash'
import { isNumber, isString } from '../utilities';

export interface Dictionary<T> {
   [Key: string]: T
}

const isUserAuthorizedForResource = (_:string, __: any):boolean => {
   return true;
}

const securedDirectivesFunctionsMap: Record<string, (source:any, args:any, context:any, info:any, result:any) => Object|null> = {
   secure: (
      _: any,
      args: any,
      context: any,
      ____: any,
      result: any,
   ) => {
      if (isUserAuthorizedForResource(args.directiveField, context)) return result;
      else return null;
   },
   redact: (
      _: any,
      args: any,
      context: any,
      ____: any,
      result: any,
   ) => {
      if (!result) return result;
      else if (isUserAuthorizedForResource(args.directiveField, context)) return result;

      if (isNumber(result)) return parseFloat(result.toString().substring(0, 2) + '0'.repeat(result.toString().length - 1));
      else return (isString(result) ? result.substring(0, 1):String(result.substring(0, 1))) + '*'.repeat(result.length - 1);
   },
   encrypt: (
      _: any,
      args: any,
      context: any,
      ____: any,
      result: any,
   ) => {
      if (!result) return result;
      else if (isUserAuthorizedForResource(args.directiveField, context)) return result;

      if (isNumber(result)) return parseFloat(result.toString());
      else if (isString(result)) 
         return result.toUpperCase().split('').reverse().join('');
   },
}

export class DataProtectorHandler {
   constructor() {}

   protectData = (
      source: any,
      args: any,
      context: any,
      info: any,
      result: any,
   ): any => {
      if (!result) return result

      if (!_.isEmpty(args.directiveFields))
         return this.handleforFields(source, args, context, info, result)
      return this.handleForDataType(source, args, context, info, result)
   }

   handleforFields = (
      source: any,
      args: any,
      context: any,
      info: any,
      result: any,
   ) => {
      for (let field in args.directiveFields) {
         if (_.isEmpty(field)) continue

         args.handler = this;
         // args.directiveField = args.directiveFields?args.directiveFields.concat("."):""+args.directiveFields[field];
         args.currentField = field;
         jsonpath.apply(
            result,
            '$..'.concat(args.directiveFields[field]),
            function(value) {
               if (!value) return value

               return args.handler.handleForDataType(
                  source,
                  {
                     ...args,
                     directiveField: args.directiveFields?args.directiveFields.concat("."):""+args.directiveFields[args.currentField],
                  },
                  context,
                  info,
                  value,
               )
            },
         )
      }

      return result
   }

   changeValueByPath(object: object, path: string, value: any) {
      if (Array.isArray(path) && path[0] === '$') {
         const pathWithoutFirstElement = path.slice(1)
         _.set(object, pathWithoutFirstElement, value)
      }
   }

   changeValuesByPath(object: object, nodes: Node[], lastPropertyName: string) {
      nodes.forEach(node => {
         this.changeValueByPath(
            object,
            node.path.toString().concat(lastPropertyName),
            node.value,
         )
      })

      return object
   }

   handleListData = (
      source: any,
      args: any,
      context: any,
      info: any,
      result: object[],
   ) => {
      if (_.isEmpty(result)) return result

      let protectedArr: any[] = []
      for (let data in result) {
         protectedArr.push(
            this.handleForDataType(source, args, context, info, data),
         )
      }

      return protectedArr
   }

   handleObjectData = (
      source: any,
      args: any,
      context: any,
      info: any,
      result: String,
   ) => {
      let protectedResult: Dictionary<any> = {}
      for (let key in result) {
         let data = result[key]
         protectedResult[key] = this.handleForDataType(
            source,
            args,
            context,
            info,
            data,
         )
      }
      return protectedResult
   }

   private handleForDataType(
      source: any,
      args: any,
      context: any,
      info: any,
      data: any,
   ) {
      if (typeof data === 'object')
         return this.handleObjectData(source, args, context, info, data)
      if (_.isArray(data))
         return this.handleListData(source, args, context, info, data)
      
      return securedDirectivesFunctionsMap[args.directiveType](source, args, context, info, data);
   }
}

interface Node {
   path: PathComponent[]
   value: any
}
