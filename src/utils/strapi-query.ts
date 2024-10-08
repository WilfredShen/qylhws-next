/* eslint-disable */

import type { Nullable } from "@/types/utils";

import { isValid } from "./validate";

export default class SQBuilder<Model extends object, Data extends object = {}> {
  private _query: QueryRawInfo<Model, Data> = {
    sort: [],
    filters: {
      rootLogical: "$and",
      attributeFilters: [],
    },
    population: [],
    fields: [] as unknown as StrapiFields<Model>,
  };

  private readonly _builderConfig: Required<BuilderConfig> = {
    defaultSort: "asc",
  };

  private _prevFilterKey?: FilterKey<Model>;
  private _nextAttributeNegate: boolean = false;
  private _prevPopulateKey?: PopulateKey<any>;
  private _isReadonly = false;

  constructor(builderConfig?: BuilderConfig) {
    if (builderConfig) {
      this._builderConfig = { ...this._builderConfig, ...builderConfig };
    }
  }

  //<editor-fold desc="Build functions">
  /**
   * @description Build Strapi query
   * @param {QueryTypes} queryType Default StrapiService
   * @return {StrapiBuiltQuery} Built query
   */
  public build(
    queryType: QueryTypes = "strapiService",
  ): StrapiBuiltQuery<Model, Data> {
    switch (queryType) {
      case "entityService": {
        return this.buildEntityService();
      }

      case "queryEngine": {
        return this.buildQueryEngine();
      }

      case "strapiService": {
        return this.buildStrapiService();
      }

      default: {
        return this.buildStrapiService();
      }
    }
  }

  /**
   * @description Build Strapi query for Strapi service
   * @return {StrapiBuiltQuery} Built query
   */
  public buildStrapiService(): StrapiBuiltQuery<Model, Data> {
    return SQBuilder._buildQuery(this._query, "strapiService");
  }

  /**
   * @description Build Strapi query for Entity service
   * @return {StrapiBuiltQuery} Built query
   */
  public buildEntityService(): StrapiBuiltQuery<Model, Data> {
    return SQBuilder._buildQuery(this._query, "entityService");
  }

  /**
   * @description Build Strapi query for Query service
   * @return {StrapiBuiltQuery} Built query
   */
  public buildQueryEngine(): StrapiBuiltQuery<Model, Data> {
    return SQBuilder._buildQuery(this._query, "queryEngine");
  }
  //</editor-fold>

  //<editor-fold desc="Filters functions">
  /**
   * @description Start filter query
   * @description If the attribute is empty, it expects a logical filter or a nested filter "with"
   * @param {FilterCallback| FilterKey} attribute Can be key or callback with same builder for visual filter grouping
   * @param {FilterCallback} thisCallback Provides same builder to group filters chains
   * @return {SQBuilder} This builder
   */
  public filters(
    attribute?: FilterCallback<Model, Data> | FilterKey<Model>,
    thisCallback?: FilterCallback<Model, any>,
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (typeof attribute === "function") {
      attribute(this);
      return this;
    }

    if (attribute !== undefined) {
      this._prevFilterKey = attribute;
    }

    if (thisCallback !== undefined && typeof thisCallback === "function") {
      thisCallback(this);
      return this;
    }

    return this;
  }

  /**
   * Add deep nested filters to current filters
   * Callback provide new builder
   * @param nestedCallback
   * @return {SQBuilder} This builder
   */
  public with<NestedModel extends object = {}>(
    nestedCallback: FilterCallback<NestedModel, any>,
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const nestedBuilder = new SQBuilder<NestedModel, any>();
    nestedCallback(nestedBuilder);

    this._addToFilter(
      {
        key: this._prevFilterKey,
        nested:
          nestedBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
      },
      () => {
        this._prevFilterKey = undefined;
      },
    );

    return this;
  }

  //<editor-fold desc="Logical filters">
  /**
   * @description Negates current attribute or logical filter
   * @return {SQBuilder} This builder
   */
  public not(): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const target =
      this._prevFilterKey !== undefined ? "attribute" : "negateRoot";

    target === "negateRoot"
      ? (this._query.filters.negate = true)
      : (this._nextAttributeNegate = true);

    return this;
  }

  /**
   * @description Add logical OR filter.
   * @return {SQBuilder} This builder
   */
  public or(): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.filters.rootLogical = "$or";
    return this;
  }

  /**
   * @description Add logical AND filter.
   * @return {SQBuilder} This builder
   */
  public and(): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.filters.rootLogical = "$and";
    return this;
  }
  //</editor-fold>

  //<editor-fold desc="Attributes filters">
  /**
   * @description Add "Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public eq(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$eq", value);
  }

  /**
   * @description Add "Equal insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public eqi(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$eqi", value);
  }

  /**
   * @description Add "Not Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public ne(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$ne", value);
  }

  /**
   * @description Add "In" attribute filter
   * @param {MultipleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public in(value: MultipleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$in", value);
  }

  /**
   * @description Add "Not In" attribute filter
   * @param {MultipleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public notIn(value: MultipleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$notIn", value);
  }

  /**
   * @description Add "Less Than" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public lt(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$lt", value);
  }

  /**
   * @description Add "Less Than or Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public lte(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$lte", value);
  }

  /**
   * @description Add "Greater Than" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public gt(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$gt", value);
  }

  /**
   * @description Add "Greater Than or Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public gte(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$gte", value);
  }

  /**
   * @description Add "Contains" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public contains(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$contains", value);
  }

  /**
   * @description Add "Not Contains" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public notContains(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$notContains", value);
  }

  /**
   * @description Add "Contains case-insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public containsi(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$containsi", value);
  }

  /**
   * @description Add "Not Contains case-insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public notContainsi(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$notContainsi", value);
  }

  /**
   * @description Add "Start with" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public startsWith(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$startsWith", value);
  }

  /**
   * @description Add "Ends with" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public endsWith(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$endsWith", value);
  }

  /**
   * @description Add "Is null" attribute filter
   * @param {boolean} value
   * @return {SQBuilder} This builder
   */
  public null(value: boolean): SQBuilder<Model, Data> {
    return this._addAttribute("$null", value);
  }

  /**
   * @description Add "Is not null" attribute filter
   * @param {boolean} value
   * @return {SQBuilder} This builder
   */
  public notNull(value: boolean): SQBuilder<Model, Data> {
    return this._addAttribute("$notNull", value);
  }

  /**
   * @description Add "Between" attribute filter
   * @param {MultipleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public between(value: MultipleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$between", value);
  }
  //</editor-fold>

  private _addAttribute(
    type: FilterAttributeType,
    value: AttributeValues,
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (this._prevFilterKey !== undefined) {
      this._addToFilter(
        {
          key: this._prevFilterKey,
          type: type,
          value,
          negate: this._nextAttributeNegate,
        },
        () => {
          this._prevFilterKey = undefined;
          this._nextAttributeNegate = false;
        },
      );
    }

    return this;
  }

  private _addToFilter(
    filter: StrapiAttributesFilter<Model>,
    onAdded?: () => void,
  ) {
    this._query.filters.attributeFilters.push(filter);
    onAdded && onAdded();
  }
  //</editor-fold>

  //<editor-fold desc="Population">
  /**
   * @description Add query populate
   * @description Can be as a simple key or take a callback for nested query
   * @param {StrapiPopulateInputQuery} populateQuery
   * @param {PopulateCallback} nestedCallback Provides callback with new builder for nested filtering, sorting and fields selection
   * @return {SQBuilder} This builder
   */
  public populate<PopulateModel extends object>(
    populateQuery: StrapiPopulateInputQuery<Model>,
    nestedCallback?: PopulateCallback<PopulateModel>,
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    let nestedBuilder: SQBuilder<PopulateModel, any> | undefined = undefined;

    const parsedPopulateQuery = SQBuilder._parsePopulation<
      Model,
      PopulateModel
    >(populateQuery);

    const singlePopulateQuery = parsedPopulateQuery[0];

    if (nestedCallback !== undefined && typeof nestedCallback === "function") {
      nestedBuilder = new SQBuilder<PopulateModel, any>({
        defaultSort: this._builderConfig.defaultSort,
      });
      nestedBuilder.setPrevPopulationKey(singlePopulateQuery.key);
      nestedCallback(nestedBuilder);
    }

    if (nestedBuilder) {
      const findMorph = nestedBuilder.getPopulationByKey<PopulateModel>(
        singlePopulateQuery.key as PopulateKey<PopulateModel>,
      );

      const isMorphData =
        findMorph !== undefined &&
        !!findMorph.nestedQuery &&
        !SQBuilder._isDefaultQueryPopulation(findMorph.nestedQuery);

      parsedPopulateQuery[0] = {
        key: singlePopulateQuery.key,
        nestedQuery: isMorphData
          ? findMorph.nestedQuery
          : {
              fields: nestedBuilder.getRawFields(),
              population: nestedBuilder.getRawPopulation(),
              sort: nestedBuilder.getRawSort(),
              filters: nestedBuilder.getRawFilters(),
            },
      };
    }

    for (const population of parsedPopulateQuery) {
      this._addToPopulate(population);
    }

    return this;
  }

  /**
   * @description Add populate fragments for dynamic zones
   * @param {string} componentTypeKey Component type key
   * @param {PopulateCallback} nestedCallback Dynamic component builder
   * @return {SQBuilder} This builder
   */
  public on<PopulateModel extends object>(
    componentTypeKey: string,
    nestedCallback: PopulateCallback<PopulateModel>,
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (this._prevPopulateKey === undefined) {
      return this;
    }

    const populationIndex = this._query.population.findIndex(
      p => p.key === this._prevPopulateKey,
    );

    const nestedBuilder: SQBuilder<PopulateModel, any> = new SQBuilder<
      PopulateModel,
      any
    >({
      defaultSort: this._builderConfig.defaultSort,
    });

    nestedCallback(nestedBuilder);

    const newQuery: MorphOnPopulate<PopulateModel> = {};
    Object.assign(newQuery, {
      [componentTypeKey]: {
        fields: nestedBuilder.getRawFields(),
        population: nestedBuilder.getRawPopulation(),
        sort: nestedBuilder.getRawSort(),
        filters: nestedBuilder.getRawFilters(),
      },
    });

    if (populationIndex === -1) {
      this._query.population.push({
        key: this._prevPopulateKey as PopulateKey<Model>,
        nestedQuery: newQuery,
      });
    } else {
      const populationQuery = this._query.population[populationIndex];

      this._query.population[populationIndex] = {
        key: this._prevPopulateKey as PopulateKey<Model>,
        nestedQuery: { ...populationQuery.nestedQuery, ...newQuery },
      };
    }

    return this;
  }

  private _addToPopulate<PopulateModel extends object>(
    populate: StrapiPopulate<Model, PopulateModel>,
  ) {
    if (populate.key === "*") {
      this._query.population = [{ key: populate.key }];
      return;
    }

    const founded = this._query.population.findIndex(f => {
      return f.key === populate.key;
    });

    if (founded === -1) {
      this._query.population.push(populate);
    } else {
      this._query.population[founded] = populate;
    }
  }

  private static _parsePopulation<
    ParentModel extends object,
    PopulateModel extends object,
  >(
    populationQuery: StrapiPopulateInputQuery<ParentModel>,
  ): StrapiPopulate<ParentModel, PopulateModel>[] {
    if (populationQuery === "*") {
      return [{ key: "*" }];
    }

    if (this._isArrayOfPopKeys(populationQuery)) {
      return populationQuery.map(
        s => ({ key: s } as StrapiPopulate<ParentModel, PopulateModel>),
      );
    }

    if (this._isNotArrayOfPopKeys(populationQuery)) {
      return [{ key: populationQuery }];
    }

    return [];
  }

  private static _isNotArrayOfPopKeys<ParentModel extends object>(
    query: StrapiPopulateInputQuery<ParentModel>,
  ): query is PopulateKey<ParentModel> {
    return !Array.isArray(query);
  }

  private static _isArrayOfPopKeys<ParentModel extends object>(
    query:
      | GetRelations<ParentModel>
      | GetRelations<ParentModel>[]
      | string
      | string[],
  ): query is PopulateKey<ParentModel>[] {
    return Array.isArray(query);
  }

  private static _isDefaultQueryPopulation<PopulateModel extends object>(
    query: PopulateNestedQuery<PopulateModel>,
  ): query is DefaultPopulate<PopulateModel> {
    return (
      "sort" in query ||
      "filters" in query ||
      "population" in query ||
      "fields" in query
    );
  }
  //</editor-fold>

  //<editor-fold desc="Fields">
  /**
   * @description Add filed selection to query
   * @description Same keys will be merged
   * @param {StrapiFieldsInputQuery} fields
   * @return {SQBuilder} This builder
   */
  public fields(fields: StrapiFieldsInputQuery<Model>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const nowFields = this._query.fields;
    const newFields = (Array.isArray(fields) ? fields : [fields]) as string[];
    this._query.fields = union(nowFields, newFields) as StrapiFields<Model>;

    return this;
  }
  //</editor-fold>

  //<editor-fold desc="Sort">
  /**
   * @description Add sorting to query
   * @description Same keys will be merged
   * @param {StrapiSortInputQuery} sortQuery
   * @return {SQBuilder} This builder
   */
  public sort(sortQuery: StrapiSortInputQuery<Model>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const nowSortValue = this._query.sort;
    const parsedSortQuery = SQBuilder._parseSortObject<Model>(
      sortQuery,
      this._builderConfig.defaultSort,
    );

    this._query.sort = unionBy(
      v => v.key,
      Array.isArray(nowSortValue) ? nowSortValue : [nowSortValue],
      Array.isArray(parsedSortQuery) ? parsedSortQuery : [parsedSortQuery],
    );

    return this;
  }

  /**
   * @description Add sort ascending direction to last sort element or all sort chain
   * @description Same keys will be merged
   * @param {boolean} changeAll
   * @return {SQBuilder} This builder
   */
  public asc(changeAll = false) {
    if (this._isReadonly) {
      return this;
    }

    this._changeSortDirection(changeAll, "asc");

    return this;
  }

  /**
   * @description Add sort descending direction to last sort element or all sort chain
   * @param {boolean} changeAll
   * @return {SQBuilder} This builder
   */
  public desc(changeAll = false) {
    if (this._isReadonly) {
      return this;
    }

    this._changeSortDirection(changeAll, "desc");

    return this;
  }

  private _changeSortDirection(
    changeAll = false,
    direction: StrapiSortOptions,
  ) {
    if (!changeAll) {
      const lastIndex = this._query.sort.length - 1;
      if (lastIndex === -1) {
        return;
      }

      const lastSort = this._query.sort[lastIndex];
      if (lastSort === undefined) {
        return;
      }
      this._query.sort[lastIndex] = { ...lastSort, type: direction };
      return;
    }

    this._query.sort = this._query.sort.map(s => ({ ...s, type: direction }));
  }

  private static _createSortObject<ModelInput extends object>(
    stringKey: SortKey<ModelInput>,
    defaultSort: StrapiSortOptions,
  ): StrapiSort<ModelInput> {
    return { key: stringKey, type: defaultSort };
  }

  private static _createSortObjectArray<ModelInput extends object>(
    stringArray: SortKey<ModelInput>[],
    defaultSort: StrapiSortOptions,
  ): StrapiSort<ModelInput>[] {
    return stringArray.map(s => SQBuilder._createSortObject(s, defaultSort));
  }

  private static _parseSortObject<ModelInput extends object>(
    sortQuery: StrapiSortInputQuery<ModelInput>,
    defaultSort: StrapiSortOptions,
  ): StrapiSort<ModelInput> | StrapiSort<ModelInput>[] {
    if (this._isSortArray(sortQuery)) {
      if (this._isArrayOfKeys(sortQuery)) {
        return SQBuilder._createSortObjectArray<ModelInput>(
          sortQuery,
          defaultSort,
        );
      } else {
        return sortQuery;
      }
    } else {
      if (this._isSortObject(sortQuery)) {
        return sortQuery;
      }
      if (this._isSortKey(sortQuery)) {
        return SQBuilder._createSortObject(sortQuery, defaultSort);
      }

      return [];
    }
  }

  private static _isSortObject<ModelInput extends object>(
    sortQuery: StrapiSortInputQuery<ModelInput>,
  ): sortQuery is StrapiSort<ModelInput> {
    return typeof sortQuery === "object";
  }

  private static _isSortKey<ModelInput extends object>(
    sortQuery: StrapiSortInputQuery<ModelInput>,
  ): sortQuery is SortKey<ModelInput> {
    return typeof sortQuery === "string";
  }

  private static _isSortArray<ModelInput extends object>(
    sortQuery: StrapiSortInputQuery<ModelInput>,
  ): sortQuery is
    | StrapiSort<ModelInput>[]
    | GetStrictOrWeak<
        ModelInput,
        FieldPath<ModelInput>[],
        FieldPath<ModelInput>[] | string | string[]
      > {
    return Array.isArray(sortQuery);
  }

  private static _isArrayOfKeys<ModelInput extends object>(
    sortQuery:
      | StrapiSort<ModelInput>[]
      | GetStrictOrWeak<
          ModelInput,
          FieldPath<ModelInput>[],
          FieldPath<ModelInput>[] | string | string[]
        >,
    // @ts-ignore
  ): sortQuery is SortKey<ModelInput>[] {
    return (
      this._isSortArray(sortQuery) && sortQuery.every(s => !!this._isSortKey(s))
    );
  }
  //</editor-fold>

  // <editor-fold desc="Pagination">
  /**
   * @description Add StrapiService like page
   * @param {number} page
   * @param {boolean} withCount
   * @return {SQBuilder} This builder
   */
  public page(page: number, withCount?: boolean): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.pagination = { ...this._query.pagination, page };

    if (isValid(withCount)) {
      this._query.pagination.withCount = withCount;
    }

    return this;
  }

  /**
   * @description Add StrapiService like page size
   * @param {number} pageSize
   * @return {SQBuilder} This builder
   */
  public pageSize(pageSize: number): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }
    this._query.pagination = { ...this._query.pagination, pageSize };
    return this;
  }

  /**
   * @description Add Offset like page start
   * @param {number} start
   * @param {boolean} withCount
   * @return {SQBuilder} This builder
   */
  public pageStart(start: number, withCount?: boolean): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }
    this._query.offsetPagination = { ...this._query.offsetPagination, start };

    if (isValid(withCount)) {
      this._query.offsetPagination.withCount = withCount;
    }

    return this;
  }

  /**
   * @description Add Offset like page limit
   * @param {number} limit
   * @return {SQBuilder} This builder
   */
  public pageLimit(limit: number): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }
    this._query.offsetPagination = {
      ...this._query.offsetPagination,
      limit,
    };
    return this;
  }
  // </editor-fold>

  // <editor-fold desc="Data">
  /**
   * @description Add Any input data to query
   * @param {object} dataObject
   * @return {SQBuilder} This builder
   */
  public data(dataObject: Data): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.data = dataObject;
    return this;
  }
  // </editor-fold>

  // <editor-fold desc="Protected utils">
  protected getRawFilters(): StrapiRawFilters<Model> {
    return this._query.filters;
  }
  protected getRawFields(): StrapiFields<Model> {
    return this._query.fields;
  }
  protected getRawSort(): StrapiSort<Model>[] {
    return this._query.sort;
  }
  protected getRawPopulation(): StrapiPopulate<Model, any>[] {
    return this._query.population;
  }
  protected getRawPagination(): {
    pagination?: StrapiPagination;
    offsetPagination?: StrapiOffsetPagination;
  } {
    return {
      pagination: this._query.pagination,
      offsetPagination: this._query.offsetPagination,
    };
  }

  protected setPrevPopulationKey<PopulationModel extends object>(
    populationKey: PopulateKey<PopulationModel>,
  ): void {
    this._prevPopulateKey = populationKey;
  }
  protected getPopulationByKey<PopulationModel extends object>(
    populationKey: PopulateKey<Model>,
  ): StrapiPopulate<Model, PopulationModel> | undefined {
    return this._query.population.find(p => p.key === populationKey);
  }
  // </editor-fold>

  //<editor-fold desc="Public functions">
  /**
   * @description Make the builder read-only that all filter methods don't change query state
   * @param {PublicationStates} state
   * @return {SQBuilder} This builder
   */
  public publicationState(state: PublicationStates): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.publicationState = state;

    return this;
  }

  /**
   * @description Make the builder read-only that all filter methods don't change query state
   * @param {string} code
   * @return {SQBuilder} This builder
   */
  public locale(code: string): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.locale = code;

    return this;
  }

  /**
   * @description Make the builder read-only that all filter methods don't change query state
   * @param {boolean} isReadonly
   * @return {SQBuilder} This builder
   */
  public readonly(isReadonly?: boolean): SQBuilder<Model, Data> {
    this._isReadonly = isReadonly === undefined ? true : isReadonly;
    return this;
  }

  /**
   * @description Join external builder pagination
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinPagination<T extends object, F extends object>(
    builder: SQBuilder<T, F>,
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalPagination = builder.getRawPagination();

    if (isDefined(externalPagination?.pagination)) {
      this._query.pagination = {
        ...this._query.pagination,
        ...externalPagination.pagination,
      };
    }

    if (isDefined(externalPagination?.offsetPagination)) {
      this._query.offsetPagination = {
        ...this._query.offsetPagination,
        ...externalPagination.offsetPagination,
      };
    }

    return this;
  }

  /**
   * @description Join external builder population
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinPopulation<T extends object, F extends object>(
    builder: SQBuilder<T, F>,
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalPopulation =
      builder.getRawPopulation() as unknown as StrapiPopulate<Model, any>[];

    this._query.population = unionBy(
      p => p.key,
      this._query.population,
      externalPopulation,
    );

    return this;
  }

  /**
   * @description Join external builder filters
   * @param {SQBuilder} builder External builder
   * @param {boolean} mergeRootLogical If true, the main logic filter will be overwritten by the input
   * @return {SQBuilder} This builder
   */
  public joinFilters<T extends object, F extends object>(
    builder: SQBuilder<T, F>,
    mergeRootLogical: boolean = false,
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalFilters = builder.getRawFilters();

    this._query.filters.attributeFilters =
      this._query.filters.attributeFilters.concat(
        externalFilters.attributeFilters as unknown as StrapiAttributesFilter<Model>[],
      );

    this._query.filters.negate = externalFilters.negate;

    if (mergeRootLogical) {
      this._query.filters.rootLogical = externalFilters.rootLogical;
    }

    return this;
  }

  /**
   * @description Join external builder sorts
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinSort(builder: SQBuilder<Model, Data>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalSort = builder.getRawSort();

    this._query.sort = unionBy<StrapiSort<Model>>(
      s => s.key,
      this._query.sort,
      externalSort,
    );

    return this;
  }

  /**
   * @description Join external builder fields
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinFields(builder: SQBuilder<Model, Data>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalFields = builder.getRawFields();
    this._query.fields = union(
      this._query.fields,
      externalFields,
    ) as StrapiFields<Model>;

    return this;
  }

  /**
   * @description Join all state
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinAll(builder: SQBuilder<Model, Data>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this.joinPagination(builder);
    this.joinPopulation(builder);
    this.joinFilters(builder);
    this.joinSort(builder);
    this.joinFields(builder);

    return this;
  }
  //</editor-fold>

  // <editor-fold desc="Query parsing utils">
  private static _buildQuery<Md extends object, Dt extends object>(
    rawQuery: QueryRawInfo<Md, Dt>,
    queryType: QueryTypes = "strapiService",
  ): StrapiBuiltQuery<Md, Dt> {
    const isQueryEngine = queryType === "queryEngine";
    let parsedQuery: StrapiBuiltQuery<Md, Dt> = {};

    // Parsed sort values the same in service, entity service and query engine
    const sort = SQBuilder._parseSort<Md>(rawQuery.sort);
    if (sort !== undefined) {
      parsedQuery[isQueryEngine ? "orderBy" : "sort"] = sort;
    }

    // Fields values the same in service, entity service and query engine
    if (rawQuery?.fields?.some(f => !!f)) {
      parsedQuery[isQueryEngine ? "select" : "fields"] = rawQuery.fields;
    }

    // Filter values the same in service, entity service and query engine
    const filters = SQBuilder._parseFilters<Md>(rawQuery.filters);
    if (filters !== undefined) {
      parsedQuery[isQueryEngine ? "where" : "filters"] = filters;
    }

    // Populate calls build for nested query
    const populate = SQBuilder._parsePopulate(rawQuery.population, queryType);
    if (populate !== undefined) {
      parsedQuery.populate = populate;
    }

    // Pagination for strapi service, entity service and query engine is different
    const pagination = this._parsePagination(
      queryType,
      rawQuery.pagination,
      rawQuery.offsetPagination,
    );

    if (pagination !== undefined) {
      if (queryType === "strapiService") {
        parsedQuery.pagination = pagination;
      } else {
        Object.assign(parsedQuery, pagination);
      }
    }

    // Data pass without any mods
    if (rawQuery?.data !== undefined) {
      parsedQuery.data = rawQuery.data;
    }

    // Publication state only for strapi service
    if (
      rawQuery?.publicationState !== undefined &&
      queryType === "strapiService"
    ) {
      parsedQuery.publicationState = rawQuery.publicationState;
    }

    // Locale property only for strapi service
    if (rawQuery?.locale !== undefined && queryType === "strapiService") {
      parsedQuery.locale = rawQuery.locale;
    }

    return parsedQuery;
  }

  private static _parsePagination(
    queryType: QueryTypes,
    pagination?: StrapiPagination,
    offsetPagination?: StrapiOffsetPagination,
  ): UnionPagination | undefined {
    // All engines have limit pagination
    if (isDefined(offsetPagination)) {
      if (queryType === "entityService" || queryType === "queryEngine") {
        const { start, limit } = offsetPagination;
        return { start, limit };
      }

      return offsetPagination;
    }

    // Page pagination works only for Service and Entity engines
    if (pagination !== undefined && queryType !== "queryEngine") {
      if (queryType === "entityService") {
        const { page, pageSize } = pagination;
        return { page, pageSize };
      }

      return pagination;
    }
  }

  private static _parseSort<Md extends object>(sorts?: StrapiSort<Md>[]) {
    let sortQuery: any = undefined;

    if (sorts?.some(s => !!s)) {
      const isOneSort = sorts.length === 1;

      if (isOneSort) {
        const firstSort = sorts[0];
        sortQuery = set({}, firstSort.key, firstSort.type);
      } else {
        sortQuery = [];
        for (const sort of sorts) {
          sortQuery.push(set({}, sort.key, sort.type));
        }
      }
    }

    return sortQuery;
  }

  private static _parseAttributeFilter<Md extends object>(
    filter: StrapiAttributesFilter<Md>,
  ): StrapiFiltersType<Md> | undefined {
    if (filter.nested !== undefined) {
      const nestedFilters = this._parseFilters(filter.nested);
      if (nestedFilters === undefined) {
        return undefined;
      }

      return (
        filter.key === undefined
          ? nestedFilters
          : set({}, filter.key, nestedFilters)
      ) as StrapiFiltersType<Md>;
    }

    if (filter.value === undefined || filter.type === undefined) {
      return undefined;
    }

    return filter.negate
      ? (set({}, filter.key as string, {
          ["$not"]: {
            [filter.type]: filter.value,
          },
        }) as StrapiFiltersType<Md>)
      : (set({}, filter.key as string, {
          [filter.type]: filter.value,
        }) as StrapiFiltersType<Md>);
  }

  private static _parseFilters<Md extends object>(
    rawFilters?: StrapiRawFilters<Md>,
  ): StrapiFiltersType<Md> | undefined {
    const attributeFilters = rawFilters?.attributeFilters || [];
    const rootLogical = rawFilters?.rootLogical || "$and";
    const negateRoot = rawFilters?.negate || false;

    const parsedFilters: StrapiFiltersType<Md>[] = [];

    for (const attributeQuery of attributeFilters) {
      const parsedAttribute = SQBuilder._parseAttributeFilter(attributeQuery);
      if (parsedAttribute === undefined) {
        continue;
      }

      parsedFilters.push(parsedAttribute);
    }

    if (!parsedFilters.some(f => !!f)) {
      return undefined;
    }

    const withNegate = <T>(data: T): any => {
      return negateRoot ? { ["$not"]: data } : data;
    };

    if (this._isMoreThanOneFilter(parsedFilters)) {
      return withNegate({
        [rootLogical]: parsedFilters,
      }) as StrapiFiltersType<Md>;
    } else {
      return withNegate(parsedFilters[0]);
    }
  }

  private static _isMoreThanOneFilter<Md extends object>(
    filters: StrapiFiltersType<Md>[],
  ): filters is StrapiFiltersType<Md>[] {
    return filters.length > 1;
  }

  private static _parsePopulate<Md extends object, Dt extends object>(
    populates?: StrapiPopulate<Md, Dt>[],
    queryType: QueryTypes = "strapiService",
  ): any | undefined {
    if (!populates?.some(f => !!f)) {
      return undefined;
    }

    const isQueryEngine = queryType === "queryEngine";

    let parsedPopulates: any = {};

    for (const populate of populates) {
      if (populate.key === "*") {
        parsedPopulates = isQueryEngine ? true : "*";
        break;
      }

      const isComplex = SQBuilder._isPopulateComplex(populate);

      if (isComplex) {
        const nestedQuery = populate.nestedQuery as PopulateNestedQuery<Dt>;

        const isDefaultQuery = this._isDefaultQueryPopulation(nestedQuery);

        if (isDefaultQuery) {
          Object.assign(parsedPopulates, {
            [populate.key]: SQBuilder._buildQuery(nestedQuery, queryType),
          });
        } else {
          const morphQuery = {};
          Object.entries(nestedQuery).forEach(([key, query]) => {
            const parsedQuery = SQBuilder._buildQuery(query, queryType);

            if (Object.keys(parsedQuery).length > 0) {
              Object.assign(morphQuery, {
                [key]: parsedQuery,
              });
            }
          });
          Object.assign(parsedPopulates, {
            [populate.key]: { on: morphQuery },
          });
        }
      } else {
        Object.assign(parsedPopulates, { [populate.key]: true });
      }
    }

    return parsedPopulates;
  }

  private static _isPopulateComplex<Md extends object, Dt extends object>(
    populate: StrapiPopulate<Md, Dt>,
  ) {
    return isValid(populate.nestedQuery);
  }
  // </editor-fold>
}

function set<
  Model extends { [key: string]: number | string | boolean | Model | {} },
>(obj: Model, path: string | string[], value: any) {
  const pathArray = (Array.isArray(path)
    ? path
    : path.match(/([^[.\]])+/g)) as unknown as (keyof Model)[];
  if (!pathArray) {
    return obj;
  }

  pathArray.reduce<Model>((acc, key, i) => {
    if (acc[key] === undefined) {
      // @ts-ignore FIXME: Don't know how to fix it yet.
      acc[key] = {};
    }
    if (i === pathArray.length - 1) acc[key] = value;
    return acc[key] as Model;
  }, obj);

  return obj;
}

function union(arr: string[], arr2: string[]) {
  return [...new Set(arr.concat(arr2))];
}

function unionBy<Type>(
  callback: (b: Type) => string | number | boolean,
  array1: Type[],
  array2: Type[],
) {
  return [...array1, ...array2].flat().filter(
    (
      (set: Set<string | number | boolean>) => o =>
        set.has(callback(o as Type)) ? false : set.add(callback(o as Type))
    )(new Set()),
  );
}

function isDefined<T>(value: Nullable<T>): value is T {
  return isValid(value);
}

/**
 * SQ Types and type utils
 */
// <editor-fold desc="Base types">
type QueryTypes = "strapiService" | "entityService" | "queryEngine";
type PublicationStates = "live" | "preview";
type StrapiSortOptions = "desc" | "asc";
type FilterLogicalType = "$and" | "$or" | "$not";
type FilterAttributeType =
  | "$eq"
  | "$eqi"
  | "$ne"
  | "$in"
  | "$notIn"
  | "$lt"
  | "$lte"
  | "$gt"
  | "$gte"
  | "$between"
  | "$contains"
  | "$notContains"
  | "$containsi"
  | "$notContainsi"
  | "$startsWith"
  | "$endsWith"
  | "$null"
  | "$notNull";
//</editor-fold>

// <editor-fold desc="Sort types">
type StrapiSortInputQuery<Model extends object> =
  | StrapiSort<Model>
  | StrapiSort<Model>[]
  | GetStrictOrWeak<
      Model,
      FieldPath<Model> | FieldPath<Model>[],
      FieldPath<Model> | FieldPath<Model>[] | string | string[]
    >;

type SortKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

interface StrapiSort<Model extends object> {
  key: SortKey<Model>;
  type: StrapiSortOptions;
}
// </editor-fold>

// <editor-fold desc="Pagination Types">
interface StrapiPagination {
  page?: number;
  pageSize?: number;
  withCount?: boolean;
}

interface StrapiOffsetPagination {
  start?: number;
  limit?: number;
  withCount?: boolean;
}

type UnionPagination = StrapiPagination | StrapiOffsetPagination;
// </editor-fold>

// <editor-fold desc="Filter types">
type SingleAttributeType = string | number | boolean;
type MultipleAttributeType = string[] | number[];

type FilterCallback<Model extends object, Data extends object> = (
  builder: SQBuilder<Model, Data>,
) => void;

type FilterKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

type AttributeValues = string | string[] | number | number[] | boolean;

interface StrapiAttributesFilter<
  Model extends object,
  NestedModel extends object = {},
> {
  key?: FilterKey<Model>;
  type?: FilterAttributeType;
  value?: AttributeValues;
  negate?: boolean;
  nested?: StrapiRawFilters<NestedModel>;
}

interface StrapiRawFilters<Model extends object> {
  rootLogical: FilterLogicalType;
  negate?: boolean;
  attributeFilters: StrapiAttributesFilter<Model>[];
}
// </editor-fold>

// <editor-fold desc="Population Types">
type StrapiPopulateInputQuery<Model extends object> =
  | GetStrictOrWeak<
      Model,
      GetRelations<Model> | GetRelations<Model>[],
      GetRelations<Model> | GetRelations<Model>[] | string | string[]
    >
  | "*";

type PopulateKey<Model extends object> =
  | GetStrictOrWeak<Model, GetRelations<Model>, GetRelations<Model> | string>
  | "*";

type MorphOnPopulate<PopulateModel extends object> = {
  [key: string]: Omit<QueryRawInfo<PopulateModel, object>, "pagination">;
};

type DefaultPopulate<PopulateModel extends object> = Omit<
  QueryRawInfo<PopulateModel, object>,
  "pagination"
>;

type PopulateNestedQuery<PopulateModel extends object> =
  | DefaultPopulate<PopulateModel>
  | MorphOnPopulate<PopulateModel>;

interface StrapiPopulate<
  ParentModel extends object,
  PopulateModel extends object,
> {
  key: PopulateKey<ParentModel>;
  nestedQuery?: PopulateNestedQuery<PopulateModel>;
}

type PopulateCallback<PopulationModel extends object> = (
  builder: SQBuilder<PopulationModel, any>,
) => void;
// </editor-fold>

//<editor-fold desc="Fields Types">
type StrapiFieldsInputQuery<Model extends object> = GetStrictOrWeak<
  Model,
  GetAttributes<Model> | GetAttributes<Model>[],
  GetAttributes<Model> | GetAttributes<Model>[] | string | string[]
>;

type StrapiFields<Model extends object> = GetStrictOrWeak<
  Model,
  GetAttributes<Model>[],
  GetAttributes<Model>[] | string[]
>;
//</editor-fold>

// <editor-fold desc="Query shapes">
interface BuilderConfig {
  defaultSort?: StrapiSortOptions;
}

interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSort<Model>[];
  filters: StrapiRawFilters<Model>;
  pagination?: StrapiPagination;
  offsetPagination?: StrapiOffsetPagination;
  population: StrapiPopulate<Model, any>[];
  fields: StrapiFields<Model>;
  data?: Data;
  publicationState?: PublicationStates;
  locale?: string;
}

type StrapiFiltersType<Model extends object> = {
  [key in
    | FilterLogicalType
    | FilterAttributeType
    | FieldPath<Model>
    | GetAttributes<Model>
    | GetRelations<Model>]:
    | number
    | string
    | number[]
    | string[]
    | StrapiFiltersType<Model>
    | StrapiFiltersType<Model>[];
};

interface StrapiBuiltQuery<Model extends object, Data extends object> {
  filters?: StrapiFiltersType<Model>;
  fields?: StrapiFields<Model>;
  data?: Data;
  pagination?: UnionPagination;
  population?: any;
  publicationState?: PublicationStates;
  locale?: string;
  where?: StrapiFiltersType<Model>;
  [key: string]: any;
}
// </editor-fold>

/**
 * @description Utils types for getting nested keys and values type
 * inspired by https://github.com/react-hook-form/react-hook-form/blob/274d8fb950f9944547921849fb6b3ee6e879e358/src/types/utils.ts#L119
 * @description Array will be typed as first object in type of array
 * @description Nested object works perfectly
 * @description There is 1 level limitation on Cyclic deps to prevent TS Errors
 */

type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type IsTuple<T extends ReadonlyArray<any>> = number extends T["length"]
  ? false
  : true;

type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;

type IsSameType<T1, T2> = T1 extends T2 ? true : false;

type PathImpl<
  Key extends string | number,
  Value,
  BaseType,
> = Value extends Primitive
  ? `${Key}`
  : IsSameType<Value, BaseType> extends true // There is trick to prevent typescript crush on cyclic dependencies
  ? `${Key}` | `${Key}.${keyof Value & string}`
  : `${Key}` | `${Key}.${Path<Value>}`;

type Path<Model> = Model extends ReadonlyArray<infer Value>
  ? IsTuple<Model> extends true
    ? {
        [K in TupleKey<Model>]-?: PathImpl<K & string, Model[K], Model>;
      }[TupleKey<Model>]
    : { [Key in keyof Model[0]]-?: Key & string }[keyof Model[0]]
  : {
      [Key in keyof Model]-?: PathImpl<Key & string, Model[Key], Model>;
    }[keyof Model];

type FieldPath<TFieldValues extends object> = Path<TFieldValues>;

type ArrayPathImpl<
  Key extends string | number,
  Value,
  BaseType,
> = Value extends Primitive
  ? never
  : Value extends ReadonlyArray<infer U>
  ? U extends Primitive
    ? never
    : IsSameType<Value, BaseType> extends true // There is trick to prevent typescript crush on cyclic dependencies
    ? `${Key}CyclicDepsFounded`
    : `${Key}` | `${Key}.${ArrayPath<Value>}`
  : `${Key}.${ArrayPath<Value>}`;

type ArrayPath<Model> = Model extends ReadonlyArray<infer V>
  ? IsTuple<Model> extends true
    ? {
        [Key in TupleKey<Model>]-?: ArrayPathImpl<
          Key & string,
          Model[Key],
          Model
        >;
      }[TupleKey<Model>]
    : { [Key in keyof Model[0]]-?: Key & string }[keyof Model[0]]
  : {
      [Key in keyof Model]-?: ArrayPathImpl<Key & string, Model[Key], Model>;
    }[keyof Model];

/**
 * @description Model primitive attributes
 */
type ModelPrimitive = string | number | boolean | symbol | bigint;

/**
 * @description Predicate to select primitive keys
 */
type IsAttribute<
  Key extends string | number,
  Value,
> = Value extends ModelPrimitive ? `${Key}` : never;

/**
 * @description Predicate to select relations
 */
type IsNotAttribute<
  Key extends string | number,
  Value,
> = Value extends ModelPrimitive ? never : `${Key}`;

/**
 * @description Get strict or weak type by presence of "id" in Model
 */
type GetStrictOrWeak<Model extends object, Strict, Weak> = Model extends {
  id: infer U;
}
  ? Strict
  : Weak;

/**
 * @description Get attribute keys in one level of model
 */
type GetAttributes<Model extends object> = {
  [Key in keyof Model]-?: IsAttribute<Key & string, Model[Key]>;
}[keyof Model];

/**
 * @description Get relation keys in one level of model
 */
type GetRelations<Model extends object> = {
  [Key in keyof Model]-?: IsNotAttribute<Key & string, Model[Key]>;
}[keyof Model];
