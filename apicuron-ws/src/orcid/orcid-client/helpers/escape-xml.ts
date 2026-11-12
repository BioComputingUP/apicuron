const XML_ENTITIES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;',
};

/**
 * Escapes a value for use as XML text or as a double-quoted attribute value.
 */
export function escapeXml(value: string | number): string {
	return String(value).replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);
}
