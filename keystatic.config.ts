import { config, fields, collection, singleton } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  ui: {
    brand: { name: "Portfolio Content" },
    navigation: {
      Site: ["siteSettings", "aboutContent"],
      Work: ["projects", "experience", "skillGroups"],
    },
  },
  singletons: {
    siteSettings: singleton({
      label: "Site Settings",
      path: "content/site-settings",
      schema: {
        name: fields.text({ label: "Name" }),
        role: fields.text({ label: "Role" }),
        tagline: fields.text({ label: "Tagline (Hero headline)", multiline: true }),
        subline: fields.text({ label: "Subline (plain second sentence)", multiline: true }),
        email: fields.text({ label: "Email" }),
        socials: fields.array(
          fields.object({
            label: fields.text({ label: "Label (e.g. GitHub, LinkedIn, X)" }),
            href: fields.text({ label: "URL" }),
          }),
          {
            label: "Social Links",
            itemLabel: (props) => props.fields.label.value || "Social link",
          },
        ),
        portrait: fields.image({
          label: "Portrait (transparent PNG)",
          directory: "public/images",
          publicPath: "/images/",
        }),
        portraitAlt: fields.text({ label: "Portrait alt text" }),
        contactHeadline: fields.text({
          label: "Contact section headline",
          multiline: true,
        }),
        resume: fields.file({
          label: "Resume (PDF)",
          directory: "public/files",
          publicPath: "/files/",
          validation: { isRequired: false },
        }),
      },
    }),
    aboutContent: singleton({
      label: "About Content",
      path: "content/about-content",
      schema: {
        beats: fields.array(
          fields.text({ label: "Beat", multiline: true }),
          {
            label: "Narrative beats (in order)",
            itemLabel: (props) => props.value?.slice(0, 60) || "Beat",
          },
        ),
      },
    }),
  },
  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "content/projects/*/",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        year: fields.integer({ label: "Year" }),
        role: fields.text({ label: "Role" }),
        summary: fields.text({ label: "Summary (one line)", multiline: true }),
        description: fields.text({ label: "Description (longer)", multiline: true }),
        stack: fields.array(fields.text({ label: "Technology" }), {
          label: "Stack",
          itemLabel: (props) => props.value || "Technology",
        }),
        coverImage: fields.image({
          label: "Cover Image",
          directory: "public/images/projects",
          publicPath: "/images/projects/",
        }),
        coverImageAlt: fields.text({ label: "Cover image alt text" }),
        link: fields.text({ label: "Live link (optional)", validation: { isRequired: false } }),
        repo: fields.text({ label: "Repo link (optional)", validation: { isRequired: false } }),
        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
        order: fields.integer({ label: "Sort order (lower = earlier)", defaultValue: 0 }),
      },
    }),
    experience: collection({
      label: "Experience",
      slugField: "company",
      path: "content/experience/*/",
      schema: {
        company: fields.slug({ name: { label: "Company" } }),
        role: fields.text({ label: "Role" }),
        startDate: fields.text({ label: "Start date (YYYY-MM)" }),
        endDate: fields.text({ label: 'End date (YYYY-MM, or "present")' }),
        summary: fields.text({ label: "Summary", multiline: true }),
        highlights: fields.array(fields.text({ label: "Highlight" }), {
          label: "Highlights",
          itemLabel: (props) => props.value || "Highlight",
        }),
        order: fields.integer({ label: "Sort order (lower = earlier)", defaultValue: 0 }),
      },
    }),
    skillGroups: collection({
      label: "Skill Groups",
      slugField: "category",
      path: "content/skill-groups/*/",
      schema: {
        category: fields.slug({ name: { label: "Category" } }),
        items: fields.array(
          fields.object({
            name: fields.text({ label: "Name" }),
            level: fields.select({
              label: "Level",
              options: [
                { label: "Familiar", value: "familiar" },
                { label: "Proficient", value: "proficient" },
                { label: "Expert", value: "expert" },
              ],
              defaultValue: "proficient",
            }),
          }),
          {
            label: "Items",
            itemLabel: (props) => props.fields.name.value || "Item",
          },
        ),
        order: fields.integer({ label: "Sort order (lower = earlier)", defaultValue: 0 }),
      },
    }),
  },
});
