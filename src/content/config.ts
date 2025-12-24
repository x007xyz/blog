import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		created_at: z.coerce.date(),
		updated_at: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
	}),
});

export const collections = { blog };

