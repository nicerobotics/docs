import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';

const sectionPrefixes = ['transmission', 'hardware', 'structure', 'wheels'] as const;

type SidebarGroup = StarlightRouteData['sidebar'][number] & {
	type: 'group';
	entries: StarlightRouteData['sidebar'];
};

function getCurrentSection(id: string) {
	return sectionPrefixes.find((prefix) => id === prefix || id.startsWith(`${prefix}/`));
}

function isSidebarGroup(entry: StarlightRouteData['sidebar'][number] | undefined): entry is SidebarGroup {
	if (!entry) return false;
	return entry.type === 'group' && Array.isArray((entry as SidebarGroup).entries);
}

function filterOverview(route: StarlightRouteData) {
	if (!route.toc) return;
	route.toc.items = route.toc.items.filter((item) => item.slug !== '_top');
}

function filterSidebar(route: StarlightRouteData) {
	if (route.id === '') {
		route.hasSidebar = false;
		route.toc = undefined;
		route.sidebar = [];
		return;
	}

	const section = getCurrentSection(route.id);
	if (!section) return;

	const sectionGroup = route.sidebar.find((entry) => {
		if (!isSidebarGroup(entry)) return false;
		return entry.entries.some((child) => child.type === 'link' && child.href.startsWith(`/${section}/`));
	});

	if (isSidebarGroup(sectionGroup)) {
		route.sidebar = sectionGroup.entries;
	}
}

export const onRequest = defineRouteMiddleware(async (context, next) => {
	await next();
	filterSidebar(context.locals.starlightRoute);
	filterOverview(context.locals.starlightRoute);
});
