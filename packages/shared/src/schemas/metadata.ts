import { z } from "zod";

const appIconSchema = z.object({
	rel: z.string(),
	type: z.string(),
	url: z.string(),
});

export type AppMetaIcon = z.infer<typeof appIconSchema>;

// Define AppIconFile conditionally based on environment
export const AppIconFile = typeof File !== "undefined"
	? class AppIconFile extends File {
			id?: string;

			setId(id: string) {
				this.id = id;
				return this;
			}

			static async fromFile(file: File) {
				return new AppIconFile([await file.arrayBuffer()], file.name, {
					lastModified: file.lastModified,
					type: file.type,
				});
			}
		}
	: undefined;

export const metadataSchema = z.object({
	description: z.string(),
	icon: z.string(),
	icons: z.array(appIconSchema),
	name: z.string(),
	applicationURL: z
		.string({ description: "Where your public portal can be found" })
		.url(),
});

// Define metadataFormSchema conditionally
export const metadataFormSchema = typeof File !== "undefined" && AppIconFile
	? z.object({
			name: z.string(),
			description: z.string(),
			icon: z.instanceof(AppIconFile),
			applicationURL: z.string().url(),
		})
	: z.object({
			name: z.string(),
			description: z.string(),
			icon: z.any(),
			applicationURL: z.string().url(),
		});

export type MetadataForm = z.infer<typeof metadataFormSchema>;

export type MetadataConfig = z.infer<typeof metadataSchema>;
