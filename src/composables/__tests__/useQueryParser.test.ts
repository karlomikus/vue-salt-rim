import { expect, test } from "vitest";
import { useQueryParser } from "../useQueryParser";
import qs from "qs";

test("test query parser", () => {
    const queryString = "?per_page=50&page=1&sort=-created_at&filter[bar_shelf]=true&filter[main_ingredient_id]=126&filter[collection_id]=10%2C11&filter[strings]=karlo,1,query";
    const queryObj = qs.parse(queryString, { ignoreQueryPrefix: true });

    const result = useQueryParser(queryObj);

    expect(result).toEqual({
        per_page: 50,
        page: 1,
        sort: "-created_at",
        filter: {
            bar_shelf: true,
            main_ingredient_id: 126,
            collection_id: [10, 11],
            strings: ["karlo", 1, "query"],
        },
    });
});
