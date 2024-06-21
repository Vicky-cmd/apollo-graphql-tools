import jsonpath from 'jsonpath'
import _ from 'lodash'
import type { Dictionary, IDataProtectorHandler, IEncryptionManager, Node, ProtectorContext } from '../types'
import { isNumber, isString } from '../utilities'
import { EncryptionHandler } from '../encryption'


// const isUserAuthorizedForResource = (parentType: string, directiveField:string, context: any):boolean => {
//    console.log('directiveField', directiveField);
//    if (!context.authContext || !context.authContext.authorities || !context.authContext.authorities[parentType]) return false;
//    for (let authority of context.authContext.authorities[parentType]) {
//       console.log('authority', authority);
//       if (authority.resources.includes(directiveField) && authority.authority==="read") return true;
//   }

//   return false;

// }

const getUserAuthorityForResource = <T extends ProtectorContext>(
   parentType: string,
   directiveField: string,
   context: T,
) => {
   console.log('directiveField', directiveField);
   // console.log('context', context.authContext);
   if (
      !context.authContext ||
      !context.authContext.authorities ||
      !context.authContext.authorities.get(parentType)
   )
      return 'N/A';

   let defaultAuthority = "N/A";
   for (let authority of context.authContext.authorities.get(parentType)!) {
      console.log('authority', authority);
      if (authority.resources.includes(directiveField))
         return authority.authority;
      else if (authority.resources.includes('*'))
         defaultAuthority = authority.authority.toString();
   }

   return defaultAuthority;
}

let encryptionHandler: IEncryptionManager = new EncryptionHandler();

const securedDirectivesFunctionsMap: Record<
   string,
   (
      source: any,
      args: any,
      context: any,
      info: any,
      result: any,
   ) => Object | null
> = {
   supportedTypes: () => ['secure', 'redact', 'encrypt'],
   secure: (_: any, __: any, ___: any, ____: any, _____: any) => null,
   redact: (_: any, __: any, ___: any, ____: any, result: any) => {
      if (!result) return result

      if (isNumber(result))
         return parseFloat(
            result.toString().substring(0, 1) +
            '0'.repeat(result.toString().length - 1),
         )
      else
         return (
            (isString(result)
               ? result.substring(0, 1)
               : String(result.substring(0, 1))) + '*'.repeat(result.length - 1)
         )
   },
   encrypt: (_: any, __: any, ___: any, ____: any, result: any) => {
      if (!result) return result

      if (isNumber(result)) return encryptionHandler.encryptNumber(parseFloat(result));
      else return encryptionHandler.encryptString(result);
   },
}

export class DataProtectorHandler<T extends ProtectorContext> implements IDataProtectorHandler<T> {
   constructor(encryptor: IEncryptionManager | undefined = undefined) {
      if (encryptor) encryptionHandler = encryptor;
   }

   protectData = (
      source: any,
      args: any,
      context: T,
      info: any,
      result: any,
   ): any => {
      if (!result) return result

      args.parentType = this.fetchParentType(info, args.resource);
      args.directiveField = this.getDirectiveField(info, args.resource);
      args.selections = this.getFieldSelections(info);
      if (!_.isEmpty(args.directiveFields))
         return this.handleforFields(source, args, context, info, result)
      return this.handleForDataType(source, args, context, info, result)
   }

   getFieldSelections = (info: any) => {
      for (let field of info.fieldNodes) {
         if (field.selectionSet && info.fieldName === field.name.value) {
            return field.selectionSet.selections;
         }
      }
      return [];
   }
   getDirectiveField = (info: any, resource: any) => {
      if (!_.isEmpty(resource))
         return "";
      return info.parentType.name.toLowerCase() !== 'query' ? info.fieldName : "";
   }
   fetchParentType = (info: any, resource: string | undefined = undefined) => {
      if (!_.isEmpty(resource)) return resource;
      return info.parentType.name.toLowerCase() !== 'query' ? info.parentType.name.toLowerCase() : info.returnType.name.toLowerCase();
   }

   handleforFields = (
      source: any,
      args: any,
      context: T,
      info: any,
      result: any,
   ) => {
      for (let field in args.directiveFields) {
         if (_.isEmpty(field)) continue

         args.handler = this
         args.currentField = field
         jsonpath.apply(
            result,
            '$..'.concat(args.directiveFields[field]),
            function (value) {
               if (!value) return value

               return args.handler.handleForDataType(
                  source,
                  {
                     ...args,
                     directiveField:
                        (args.directiveField
                           ? args.directiveField.concat('.')
                           : '') + args.directiveFields[args.currentField],
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
      context: T,
      info: any,
      result: object[],
   ) => {
      if (_.isEmpty(result)) return result

      let protectedArr: any[] = []
      for (let data of result) {
         let protectedData: any = this.handleForDataType(source, args, context, info, data);
         if (protectedData && protectedData !== null)
            protectedArr.push(protectedData);
      }

      return protectedArr
   }

   handleObjectData = (
      source: any,
      args: any,
      context: T,
      info: any,
      result: String,
   ) => {
      if (args.selections !== undefined && args.selections.length === 0) return result;

      let isValid = false;
      let protectedResult: Dictionary<any> = result;
      for (let selectionKey in args.selections) {
         let key = args.selections[selectionKey].name.value;
         let data = result[key]
         protectedResult[key] = this.handleForDataType(
            source,
            {
               ...args,
               directiveField: (args.directiveField
                  ? args.directiveField.concat('.')
                  : '') + key,
               selections: args.selections[selectionKey].selectionSet?.selections
            },
            context,
            info,
            data,
         )
         if (protectedResult[key] !== null)
            isValid = true;
      }
      return isValid ? protectedResult : null;
   }

   handleForDataType(
      source: any,
      args: any,
      context: T,
      info: any,
      data: any,
   ) {
      console.log('data', args.directiveField)
      if (_.isArray(data))
         return this.handleListData(source, args, context, info, data)
      if (typeof data === 'object')
         return this.handleObjectData(source, args, context, info, data)

      let userAuthority = getUserAuthorityForResource(
         args.parentType,
         args.directiveField,
         context,
      )
      if (userAuthority === 'read') return data
      else if (userAuthority === 'write') userAuthority = 'N/A';
      return securedDirectivesFunctionsMap[
         userAuthority !== 'N/A' 
            // @ts-ignore
            && securedDirectivesFunctionsMap.supportedTypes().includes(userAuthority)? 
               userAuthority : args.directiveType
      ](source, args, context, info, data)
   }
}
