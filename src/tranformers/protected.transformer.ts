import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLObjectType } from 'graphql';
import type { ProtectedDirectiveArgs } from '../types/graphql.js';
import type { TProtectedTransformerProps } from '../types/index.js';
import { DataProtectorHandler } from './DataProtectorHandler.js';
import { fieldResolver } from './fuctions.js';

const protectedDirectiveTransformer = ({
   schema,
   handler = new DataProtectorHandler(),
}: TProtectedTransformerProps) => {
   const directiveName: string = 'Secured'
   return mapSchema(schema, {
      // This is the object level resolver
      [MapperKind.OBJECT_TYPE]: objectConfig => {
         // Check whether this field has the specified directive
         const securedDirective = getDirective(
            schema,
            objectConfig,
            directiveName,
         )?.[0]

         if (securedDirective) {
            let { type, fields }: ProtectedDirectiveArgs = securedDirective

            const config = objectConfig.toConfig()
            let keys = Object.keys(config.fields)

            if (fields && fields.length > 0) {
               for (let fieldIndex in fields) {
                  if (!fields[fieldIndex] || fields[fieldIndex] == null)
                     continue
                  let fieldEntry = fields[fieldIndex]!
                  let field: string = fieldEntry
                  let isSubArray: boolean = false
                  if (field.includes('.')) {
                     field = field.split('.')[0]
                     isSubArray = true
                  }

                  if (keys.includes(field)) {
                     let configField = config.fields[field]
                     let { resolve = defaultFieldResolver } = configField
                     configField.resolve = async function(
                        source,
                        args,
                        context,
                        info,
                     ) {
                        if (isSubArray)
                           args.directiveFields = fieldEntry
                              .substring(
                                 fieldEntry.indexOf('.') + 1,
                                 fieldEntry.length,
                              )
                              .split('|')
                        let result = await resolve(source, args, context, info)
                        return handler.protectData(
                           source,
                           {
                              ...args,
                              directiveType: type,
                           },
                           context,
                           info,
                           result,
                        )
                     }
                  }
               }
            } else {
               for (let key in config.fields) {
                  let field = config.fields[key]
                  let { resolve = defaultFieldResolver } = field
                  field.resolve = async function(source, args, context, info) {
                     let result = await resolve(source, args, context, info)
                     return handler.protectData(
                        source,
                        {
                           ...args,
                           directiveType: type,
                           directiveFields: fields,
                        },
                        context,
                        info,
                        result,
                     )
                  }
               }
            }

            return new GraphQLObjectType(config)
         }

         return objectConfig;
      },
      // This is the field level resolver
      [MapperKind.OBJECT_FIELD]: fieldConfig => {
         const securedDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
         )?.[0]

         const { resolve = defaultFieldResolver } = fieldConfig
         if (securedDirective) {
            let { type } = securedDirective
            fieldConfig.resolve = fieldResolver(handler, resolve, type);
            // fieldConfig.resolve = async function(source, args, context, info) {
            //    const result = await resolve(source, args, context, info)
            //    return handler.protectData(
            //       source,
            //       {
            //          ...args,
            //          directiveType: type,
            //       },
            //       context,
            //       info,
            //       result,
            //    )
            // }
         }
         return fieldConfig
      },
   })
}

export { protectedDirectiveTransformer };

