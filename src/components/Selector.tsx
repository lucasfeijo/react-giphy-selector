import * as React from "react";
import * as cn from "classnames";

import { Rating, ResultSort, IGifObject } from "../types";
import { GiphyClient, ISearchResult } from "../lib/GiphyClient";
import { QueryForm } from "./QueryForm";
import { Suggestions } from "./Suggestions";
import { SearchResults } from "./SearchResults";
const defaultStyle = require("./Selector.css");
const attributionMark = require("../img/PoweredBy_200px-White_HorizText.png");

export interface ISelectorProps {
  // main props
  apiKey: string;
  rating?: Rating;
  sort?: ResultSort;
  limit?: number;
  suggestions?: string[];
  queryInputPlaceholder?: string;
  resultColumns?: number;
  onGifSelected: (gifObject: IGifObject) => void;
  showGiphyMark?: boolean;

  // query form style/content props
  queryFormClassName?: string;
  queryFormInputClassName?: string;
  queryFormSubmitClassName?: string;
  queryFormStyle?: object;
  queryFormInputStyle?: object;
  queryFormSubmitStyle?: object;
  queryFormSubmitContent?: any;

  // search results style
  searchResultsClassName?: string;
  searchResultsStyle?: object;
  searchResultClassName?: string;
  searchResultStyle?: object;

  suggestionsClassName?: string;
  suggestionsStyle?: object;
  suggestionClassName?: string;
  suggestionStyle?: object;

  // loader style/content props
  loaderClassName?: string;
  loaderStyle?: object;
  loaderContent?: any;

  // error style/content props
  searchErrorClassName?: string;
  searchErrorStyle?: object;

  // footer style props
  footerClassName?: string;
  footerStyle?: object;
}

export interface ISelectorState {
  query: string;
  isPending: boolean;
  searchError?: Error;
  searchResult?: ISearchResult;
}

export class Selector extends React.Component<ISelectorProps, ISelectorState> {
  private form: QueryForm
  private setFormRef: (QueryForm) => void

  public static defaultProps: Partial<ISelectorProps> = {
    rating: Rating.G,
    sort: ResultSort.Relevant,
    limit: 20,
    resultColumns: 3,
    showGiphyMark: true,
    queryInputPlaceholder: 'Enter search text',
    suggestions: [],
    loaderContent: "Loading...",
    loaderStyle: {},
    queryFormSubmitContent: "Search",
    footerStyle: {},
    searchErrorStyle: {},
    searchResultsStyle: {},
    searchResultStyle: {},
    suggestionStyle: {},
    suggestionsStyle: {}
  };

  public client: GiphyClient;

  constructor(props: ISelectorProps) {
    super(props);

    // Setup a new giphy client
    this.client = new GiphyClient(props.apiKey);

    // Set initial state
    this.state = {
      query: "",
      isPending: false,
      searchError: null,
      searchResult: null
    };

    this.onQueryChange = this.onQueryChange.bind(this);
    this.onQueryExecute = this.onQueryExecute.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.setFormRef = element => {
      this.form = element;
    }
  }

  /**
   * Fired when the query value changes for the
   * search
   * @param q string
   * @param cb func optional callback for when state is done updating
   */
  public onQueryChange(q: string, cb?: () => void): void {
    // Update the query
    this.setState({ query: q }, cb);
  }

  /**
   * Fired when the query should be executed
   */
  public onQueryExecute(): void {
    const { query } = this.state;
    const { rating, sort, limit } = this.props;

    this.setState({
      isPending: true,
      searchError: null
    });

    this.client
      .searchGifs({
        q: query,
        rating,
        limit,
        sort,
        offset: 0
      })
      .then((result: ISearchResult) => {
        this.setState({
          isPending: false,
          searchResult: result
        });
      })
      .catch((err: Error) => {
        this.setState({
          isPending: false,
          searchError: err
        });
      });
  }

  public performQuery(query: string): void {
    this.setState({ query });
    this.form.onSubmit({});
  }

  /**
   * Fired when a suggestion has been selected
   */
  public onSuggestionSelected(q: string): void {
    // Update query and wait for state change to finish
    // before executing query
    this.onQueryChange(q, () => {
      this.onQueryExecute();
    });
  }

  public render(): JSX.Element {
    const { query, searchResult, isPending, searchError } = this.state;
    const {
      suggestions,
      onGifSelected,
      queryInputPlaceholder,
      resultColumns,
      showGiphyMark,

      queryFormClassName,
      queryFormInputClassName,
      queryFormSubmitClassName,
      queryFormStyle,
      queryFormInputStyle,
      queryFormSubmitStyle,
      queryFormSubmitContent,

      searchResultClassName,
      searchResultStyle,
      searchResultsClassName,
      searchResultsStyle,

      suggestionClassName,
      suggestionStyle,
      suggestionsClassName,
      suggestionsStyle,

      loaderClassName,
      loaderStyle,
      loaderContent,

      searchErrorClassName,
      searchErrorStyle,

      footerClassName,
      footerStyle
    } = this.props;

    const showSuggestions =
      !!suggestions.length && !searchResult && !isPending && !searchError;

    return (
      <div>
        <QueryForm
          ref={this.setFormRef}
          queryInputPlaceholder={queryInputPlaceholder}
          onQueryChange={this.onQueryChange}
          onQueryExecute={this.onQueryExecute}
          queryValue={query}
          queryFormClassName={queryFormClassName}
          queryFormInputClassName={queryFormInputClassName}
          queryFormSubmitClassName={queryFormSubmitClassName}
          queryFormStyle={queryFormStyle}
          queryFormInputStyle={queryFormInputStyle}
          queryFormSubmitStyle={queryFormSubmitStyle}
          queryFormSubmitContent={queryFormSubmitContent}
        />

        {showSuggestions && (
          <Suggestions
            suggestions={suggestions}
            onSuggestionSelected={this.onSuggestionSelected}
            suggestionClassName={suggestionClassName}
            suggestionStyle={suggestionStyle}
            suggestionsClassName={suggestionsClassName}
            suggestionsStyle={suggestionsStyle}
          />
        )}

        {isPending && (
          <div
            className={cn(defaultStyle.loader, loaderClassName)}
            style={loaderStyle}
          >
            {loaderContent}
          </div>
        )}

        {!isPending &&
          !!searchError && (
            <div
              className={cn(defaultStyle.searchError, searchErrorClassName)}
              style={searchErrorStyle}
            >
              {searchError.message}
            </div>
          )}

        {!isPending &&
          !!searchResult && (
            <SearchResults
              searchResultClassName={searchResultClassName}
              searchResultStyle={searchResultStyle}
              searchResultsClassName={searchResultsClassName}
              searchResultsStyle={searchResultsStyle}
              columns={resultColumns}
              gifObjects={searchResult.gifObjects}
              onGifSelected={onGifSelected}
            />
          )}
        <footer
          className={cn(defaultStyle.footer, footerClassName)}
          style={footerStyle}
        >
          {showGiphyMark && (
            <img
              className={defaultStyle.attributionMark}
              src={attributionMark}
            />
          )}
        </footer>
      </div>
    );
  }
}
