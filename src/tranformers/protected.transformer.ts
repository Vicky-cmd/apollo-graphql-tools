import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLObjectType } from 'graphql';
import type { TProtectedTransformerProps } from '../types/index.js';
import { extractFields, fieldResolver, fieldResolverForObject } from './fuctions.js';
import _ from 'lodash';

const protectedDirectiveTransformer = ({
   schema,
   handler,
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

         if (!securedDirective) return objectConfig;

         let { type, fields, resource } = securedDirective
         const config = objectConfig.toConfig()
         let keys = Object.keys(config.fields)

         if (_.isEmpty(fields)) {
            for (let key in config.fields) {
               let { resolve = defaultFieldResolver } = config.fields[key];
               config.fields[key].resolve = fieldResolver(handler, resolve, type, fields);
            }

            return new GraphQLObjectType(config);
         }

         for (let fieldIndex in fields) {
            if (!fields[fieldIndex] || fields[fieldIndex] == null) continue;

            let fieldEntry = fields[fieldIndex]!
            let { field, isSubArray } = extractFields(fieldEntry)

            if (keys.includes(field)) {
               let { resolve = defaultFieldResolver } = config.fields[field]
               config.fields[field].resolve = fieldResolverForObject(handler, isSubArray, fieldEntry, resolve, resource, type)
            }


         }

         return new GraphQLObjectType(config);
      },

      // This is the field level resolver
      [MapperKind.OBJECT_FIELD]: fieldConfig => {
         const securedDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
         )?.[0]

         if (!securedDirective) return fieldConfig;

         const { resolve = defaultFieldResolver } = fieldConfig
         let { type, resource } = securedDirective;
         fieldConfig.resolve = fieldResolver(handler, resolve, resource, type);

         return fieldConfig
      },
   })
}

export { protectedDirectiveTransformer };

