import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'
import { HomeIcon } from '@sanity/icons/Home'
import { UserIcon } from '@sanity/icons/User'
import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { CommentIcon } from '@sanity/icons/Comment'

export default defineConfig({
  name: 'default',
  title: 'Roamify',

  projectId: 'ird6lvzh',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Roamify')
          .items([
            S.documentTypeListItem('property').title('Stays').icon(HomeIcon),
            S.documentTypeListItem('host').title('Hosts').icon(UserIcon),
            S.documentTypeListItem('policy').title('Policies').icon(DocumentTextIcon),
            S.documentTypeListItem('review').title('Reviews').icon(CommentIcon),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
