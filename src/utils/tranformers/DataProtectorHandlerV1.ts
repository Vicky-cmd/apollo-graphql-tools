import jsonpath, { PathComponent } from 'jsonpath'
import _ from 'lodash'

export interface Dictionary<T> {
   [Key: string]: T
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

         args.handler = this
         jsonpath.apply(
            result,
            '$..'.concat(args.directiveFields[field]),
            function(value) {
               if (!value) return value

               return args.handler.handleForDataType(
                  source,
                  args,
                  context,
                  info,
                  value,
               )
            },
         )
      }

      return result
   }

   chnageValueByPath(object: object, path: string, value: any) {
      if (Array.isArray(path) && path[0] === '$') {
         const pathWithoutFirstElement = path.slice(1)
         _.set(object, pathWithoutFirstElement, value)
      }
   }

   changeValuesByPath(object: object, nodes: Node[], lastPropertyName: string) {
      nodes.forEach(node => {
         this.chnageValueByPath(
            object,
            node.path.toString().concat(lastPropertyName),
            node.value,
         )
      })

      return object
   }

   handleStringData = (
      _: any,
      args: any,
      __: any,
      ___: any,
      result: string,
   ) => {
      if (!args || !args.directiveType) return result

      if (args.directiveType === 'PROTECT')
         return result
            .toUpperCase()
            .split('')
            .reverse()
            .join('')
      else return result.substring(0, 1) + '*'.repeat(result.length - 1)
   }

   handleNumberData = (
      _: any,
      args: any,
      __: any,
      ___: any,
      result: String,
   ) => {
      if (args.directiveType === 'PROTECT') return parseFloat(result.toString())
      else
         return parseFloat(
            result.toString().substring(0, 2) +
               '0'.repeat(result.toString().length - 1),
         )
   }

   handleListData = (
      source: any,
      args: any,
      context: any,
      info: any,
      result: object[],
   ) => {
      if (_.isEmpty(result)) return result

      let protectedArr: object[] = []
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
      let protectedResult: Dictionary<Object> = {}
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
      if (!isNaN(data as any) && !isNaN(parseFloat(data)))
         return this.handleNumberData(source, args, context, info, data)
      if (typeof data === 'string')
         return this.handleStringData(source, args, context, info, data)
      if (typeof data === 'object')
         return this.handleObjectData(source, args, context, info, data)
      if (_.isArray(data))
         return this.handleListData(source, args, context, info, data)

      return data
   }
}

interface Node {
   path: PathComponent[]
   value: any
}
