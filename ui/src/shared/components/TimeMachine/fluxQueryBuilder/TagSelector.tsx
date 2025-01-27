import React, {ChangeEvent, Dispatch, useEffect, useMemo} from 'react'
import {connect} from 'react-redux'
import BuilderCard from './BuilderCard'
import DefaultDebouncer from 'src/shared/utils/debouncer'
import {
  RemoteDataState,
  BuilderAggregateFunctionType,
  Source,
  TimeRange,
} from 'src/types'
import SearchableDropdown from '../../SearchableDropdown'
import WaitingText from '../../WaitingText'
import {TagSelectorState, TimeMachineQueryProps} from './types'
import {
  changeFunctionTypeThunk,
  removeTagSelectorThunk,
  searchTagKeysThunk,
  searchTagValuesThunk,
  selectTagKeyThunk,
  selectTagValuesThunk,
} from './actions/thunks'
import {changeKeysSearchTerm, changeValuesSearchTerm} from './actions/tags'

const SEARCH_DEBOUNCE_MS = 400

function renderType(type: BuilderAggregateFunctionType) {
  if (type === 'group') {
    return 'Group'
  }
  return 'Filter'
}

type Callbacks = ReturnType<typeof mdtp>
type Props = TagSelectorState & Callbacks & TimeMachineQueryProps

const TagSelector = (props: Props) => {
  const {
    tagIndex,
    aggregateFunctionType,
    onRemoveTagSelector,
    onChangeFunctionType,
  } = props

  return (
    <BuilderCard>
      <BuilderCard.DropdownHeader
        options={['Filter', 'Group']}
        selectedOption={renderType(aggregateFunctionType)}
        onDelete={tagIndex !== 0 ? () => onRemoveTagSelector() : undefined}
        onSelect={val =>
          onChangeFunctionType(val === 'Filter' ? 'filter' : 'group')
        }
      />
      <TagSelectorBody {...props} />
    </BuilderCard>
  )
}

const TagSelectorBody = (props: Props) => {
  const {
    aggregateFunctionType,
    keys,
    keysStatus,
    tagKey: key,
    onSelectKey,
    valuesSearchTerm,
    onChangeValuesSearchTerm,
    onSearchValues,
    keysSearchTerm,
    onChangeKeysSearchTerm,
    onSearchKeys,
    tagValues: selectedValues,
  } = props
  if (aggregateFunctionType === 'filter') {
    if (keysStatus === RemoteDataState.Error) {
      return <BuilderCard.Empty>Failed to load tag keys</BuilderCard.Empty>
    }

    if (
      keysStatus === RemoteDataState.Done &&
      !keys.length &&
      !keysSearchTerm
    ) {
      return (
        <BuilderCard.Empty testID="empty-tag-keys">
          No tag keys found <small>in the current time range</small>
        </BuilderCard.Empty>
      )
    }
  }

  const debouncer = useMemo(() => new DefaultDebouncer(), [])
  useEffect(() => () => debouncer.cancelAll(), [])
  function onValueTermChange(e: ChangeEvent<HTMLInputElement>) {
    onChangeValuesSearchTerm(e.target.value)
    debouncer.call(() => onSearchValues(), SEARCH_DEBOUNCE_MS)
  }
  function onKeyTermChange(term: string) {
    onChangeKeysSearchTerm(term)
    debouncer.call(() => onSearchKeys(), SEARCH_DEBOUNCE_MS)
  }

  const placeholderText =
    aggregateFunctionType === 'group'
      ? 'Search group column values'
      : `Search ${key} tag values`
  return (
    <>
      <BuilderCard.Menu testID={`tag-selector--container`}>
        {aggregateFunctionType !== 'group' && (
          <div
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              marginBottom: '4px',
            }}
          >
            <SearchableDropdown
              items={keys}
              onChoose={(k: string) => onSelectKey(k)}
              searchTerm={keysSearchTerm}
              onChangeSearchTerm={onKeyTermChange}
              selected={key}
              buttonSize="btn-sm"
              className="dropdown-stretch"
              status={keysStatus}
            />
            {selectedValues.length ? (
              <div
                className="flux-tag-selector--count"
                title={`${selectedValues.length} value${
                  selectedValues.length === 1 ? '' : 's'
                } selected`}
              >
                {selectedValues.length}
              </div>
            ) : undefined}
          </div>
        )}
        {keysStatus === RemoteDataState.Done ? (
          <input
            className="form-control input-sm"
            placeholder={placeholderText}
            type="text"
            value={valuesSearchTerm}
            onChange={onValueTermChange}
            spellCheck={false}
            autoComplete="false"
          />
        ) : undefined}
      </BuilderCard.Menu>
      <TagSelectorValues {...props} />
    </>
  )
}

const TagSelectorValues = (props: Props) => {
  const {
    aggregateFunctionType,
    keysStatus,
    tagKey: key,
    tagIndex,
    values,
    valuesStatus,
    tagValues: selectedValues,
    onSelectValues,
  } = props
  if (aggregateFunctionType === 'filter') {
    if (keysStatus === RemoteDataState.NotStarted) {
      return (
        <BuilderCard.Empty>
          <WaitingText text="Waiting for tag keys" />
        </BuilderCard.Empty>
      )
    }

    if (keysStatus === RemoteDataState.Loading) {
      return (
        <BuilderCard.Empty>
          <WaitingText text="Loading tag keys" />
        </BuilderCard.Empty>
      )
    }
  }
  if (valuesStatus === RemoteDataState.Error) {
    return (
      <BuilderCard.Empty>
        {`Failed to load tag values for ${key}`}
      </BuilderCard.Empty>
    )
  }
  if (valuesStatus === RemoteDataState.NotStarted) {
    return (
      <BuilderCard.Empty>
        <WaitingText text="Waiting for tag values" />
      </BuilderCard.Empty>
    )
  }
  if (valuesStatus === RemoteDataState.Loading) {
    return (
      <BuilderCard.Empty>
        <WaitingText text="Loading tag values" />
      </BuilderCard.Empty>
    )
  }
  if (valuesStatus === RemoteDataState.Done && !values.length) {
    return (
      <BuilderCard.Empty>
        No values found <small>in the current time range</small>
      </BuilderCard.Empty>
    )
  }
  return (
    <BuilderCard.Body>
      <div className="flux-query-builder--list">
        {values.map((value: string) => {
          const active = selectedValues.includes(value)
          const onChange = () =>
            onSelectValues(
              active
                ? selectedValues.filter((x: string) => x !== value)
                : [value, ...selectedValues]
            )

          const divId = `flxts${tagIndex}_${value}`
          return (
            <div
              className="flux-query-builder--list-item"
              onClick={onChange}
              key={divId}
              id={divId}
            >
              <input type="checkbox" checked={active} onChange={onChange} />
              <label htmlFor={divId}>{value}</label>
            </div>
          )
        })}
      </div>
    </BuilderCard.Body>
  )
}

interface OwnProps {
  source: Source
  timeRange: TimeRange
  tagIndex: number
}

const mdtp = (dispatch: Dispatch<any>, {source, timeRange, tagIndex}) => {
  return {
    onRemoveTagSelector: () => {
      dispatch(removeTagSelectorThunk(source, timeRange, tagIndex))
    },
    onChangeFunctionType: (type: BuilderAggregateFunctionType) => {
      dispatch(changeFunctionTypeThunk(source, timeRange, tagIndex, type))
    },
    onSelectKey: (key: string) => {
      dispatch(selectTagKeyThunk(source, timeRange, tagIndex, key))
    },
    onChangeKeysSearchTerm: (term: string) => {
      dispatch(changeKeysSearchTerm(tagIndex, term))
    },
    onSearchKeys: () => {
      dispatch(searchTagKeysThunk(source, timeRange, tagIndex))
    },
    onChangeValuesSearchTerm: (term: string) => {
      dispatch(changeValuesSearchTerm(tagIndex, term))
    },
    onSearchValues: () => {
      dispatch(searchTagValuesThunk(source, timeRange, tagIndex))
    },
    onSelectValues: (values: string[]) => {
      dispatch(selectTagValuesThunk(source, timeRange, tagIndex, values))
    },
  }
}

const mstp = (state: any, {tagIndex}: OwnProps): TagSelectorState => {
  const tags = state?.fluxQueryBuilder?.tags as TagSelectorState[]
  return tags[tagIndex]
}

export default connect(mstp, mdtp)(TagSelector)
