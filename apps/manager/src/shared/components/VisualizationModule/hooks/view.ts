import i18n from "@dhis2/d2-i18n";
import { useCallback, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
	DisplayItem,
	DisplayItemType,
	VisualizationItem,
	VisualizationModule,
} from "@packages/shared/schemas";
import { last, mapValues } from "lodash";
import { useAlert } from "@dhis2/app-runtime";

export type ScreenSizeId = "sm" | "md" | "lg";

export interface ScreenSize {
	name: string;
	value: number;
	cols: number;
	id: ScreenSizeId;
}

export const SUPPORTED_SCREEN_SIZES: ScreenSize[] = [
	{ name: i18n.t("Small screens"), value: 996, cols: 6, id: "sm" },
	{ name: i18n.t("Medium screen"), value: 1200, cols: 10, id: "md" },
	{ name: i18n.t("Large screen"), value: 1500, cols: 12, id: "lg" },
] as const;

export function useManageVisualizations({
	prefix,
}: {
	prefix?: `config.groups.${number}`;
}) {
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const { getValues, setValue } = useFormContext<
		VisualizationModule,
		"config.layouts" | `config.groups.${number}.layouts`
	>();
	const configPath: `config.groups.${number}` | `config` = useMemo(() => {
		if (prefix) {
			return prefix;
		}
		return `config` as const;
	}, [prefix]);

	const { append, remove, fields } = useFieldArray<
		VisualizationModule,
		"config.items" | `config.groups.${number}.items`,
		"fieldId"
	>({
		name: `${configPath}.items`,
		keyName: "fieldId",
	});

	const addVisualizationToLayout = useCallback(
		(displayItem: DisplayItem) => {
			const layout = getValues(`${configPath}.layouts`);
			const updatedLayout = mapValues(layout, (value, key) => {
				const layoutMaxCols =
					SUPPORTED_SCREEN_SIZES.find(({ id }) => id === key)?.cols ||
					12;
				const lastItem = last(value);
				const y = lastItem ? lastItem.y + lastItem.h : 0;
				const newItem = {
					i: displayItem.item.id,
					x: 0,
					y,
					w: layoutMaxCols,
					h: 8,
				};
				return [...(value ?? []), newItem];
			});
			setValue(`${configPath}.layouts`, updatedLayout);
		},
		[configPath, getValues, setValue],
	);

	const removeVisualizationToLayout = useCallback(
		(id: string) => {
			const layout = getValues(`${configPath}.layouts`);
			const updatedLayout = mapValues(layout, (value, key) => {
				return value?.filter((item) => item.i !== id);
			});
			setValue(`${configPath}.layouts`, updatedLayout);
		},
		[configPath, getValues, setValue],
	);

	const onAddVisualization = useCallback(
		(visualization: VisualizationItem) => {
			if (fields.some((field) => field.item.id === visualization.id)) {
				show({
					message: i18n.t("This visualization is already added"),
					type: { critical: true },
				});
				return;
			}
			const displayItem: DisplayItem = {
				type: DisplayItemType.VISUALIZATION,
				item: visualization,
			};
			append(displayItem);
			addVisualizationToLayout(displayItem);
		},
		[append],
	);

	const onRemoveVisualization = useCallback(
		(id: string) => {
			removeVisualizationToLayout(id);
			const field = fields.findIndex(({ item }) => item.id === id);
			if (field === -1) {
				console.warn(`Item with id ${id} not found in fields`);
				return;
			}
			remove(field);
		},
		[remove, fields],
	);

	return {
		onAddVisualization,
		onRemoveVisualization,
	};
}
