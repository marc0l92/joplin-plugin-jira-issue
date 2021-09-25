export function unpackAttributes(attributesStr: string): any {
    const attributesObj = {}
    while (attributesStr.length > 0) {
        const matches = attributesStr.match(/ *(?<key>[a-z]+)=\"(?<value>[^"]+)\" */)
        if (!matches || !matches.groups) {
            break
        }
        attributesObj[matches.groups.key] = matches.groups.value.replace(/&quot/g, '"')
        attributesStr = attributesStr.slice(matches[0].length)
    }
    return attributesObj
}