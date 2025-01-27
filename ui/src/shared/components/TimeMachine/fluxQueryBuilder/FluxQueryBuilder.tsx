// Libraries
import React, {useMemo} from 'react'
import {connect} from 'react-redux'
import copyToClipboard from 'copy-to-clipboard'

import BuilderCard from './BuilderCard'
import BucketsSelector from './BucketsSelector'
import FancyScrollbar from '../../FancyScrollbar'
import {
  Button,
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  IconFont,
} from 'src/reusable_ui'
import AggregationSelector from './AggregationSelector'
import TagSelector from './TagSelector'
import {notify as notifyActionCreator} from 'src/shared/actions/notifications'
import {
  fluxWizardError,
  notifyCopyToClipboardFailed,
  notifyCopyToClipboardSuccess,
} from 'src/shared/copy/notifications'
import {QueryBuilderState, TimeMachineQueryProps} from './types'
import {addTagSelectorThunk} from './actions/thunks'
import timeRangeWindowPeriod from './util/timeRangeWindowPeriod'
import {RemoteDataState} from 'src/types'
import {buildQuery} from './util/generateFlux'

interface OwnProps extends TimeMachineQueryProps {
  onSubmit: (script: string) => void
  onShowEditor: () => void
  isRunnable: boolean
}

type Props = OwnProps & typeof mdtp & ReturnType<typeof mstp>

const FluxQueryBuilder = ({
  source,
  timeRange,
  tags,
  isRunnable,
  builderState,
  notify,
  onSubmit,
  onShowEditor,
  onAddTagSelector,
}: Props) => {
  const defaultPeriod = useMemo(() => timeRangeWindowPeriod(timeRange), [
    timeRange,
  ])

  return (
    <div className="flux-query-builder" data-testid="flux-query-builder">
      <div className="flux-query-builder--cards">
        <FancyScrollbar>
          <div className="builder-card--list">
            <BuilderCard testID="bucket-selector">
              <BuilderCard.Header title="From" />
              <BucketsSelector source={source} timeRange={timeRange} />
            </BuilderCard>
            {tags.map(tag => (
              <TagSelector
                source={source}
                timeRange={timeRange}
                key={tag.tagIndex}
                tagIndex={tag.tagIndex}
              />
            ))}
            <Button
              size={ComponentSize.Large}
              customClass="flux-query-builder--add-card-button"
              icon={IconFont.PlusSkinny}
              onClick={() => {
                onAddTagSelector(source, timeRange)
              }}
              shape={ButtonShape.Square}
            />
          </div>
        </FancyScrollbar>
        <AggregationSelector defaultPeriod={defaultPeriod}>
          <div className="flux-query-builder--actions">
            <Button
              size={ComponentSize.ExtraSmall}
              onClick={onShowEditor}
              text="Query Editor"
              titleText="Switch to Flux Query Editor"
            />
            <Button
              shape={ButtonShape.Square}
              size={ComponentSize.ExtraSmall}
              titleText="Copy builder query to clipboard"
              icon={IconFont.Duplicate}
              status={
                isRunnable ? ComponentStatus.Default : ComponentStatus.Disabled
              }
              onClick={e => {
                let success = false
                try {
                  const script = buildQuery(builderState)
                  success = !!script && copyToClipboard(script)
                } catch (ex) {
                  console.error('Build query failed', ex)
                }

                notify(
                  success
                    ? notifyCopyToClipboardSuccess(
                        null,
                        'Query builder flux script has been copied to clipboard.',
                        ''
                      )
                    : notifyCopyToClipboardFailed(
                        null,
                        'Query builder flux script was not copied to clipboard.',
                        ''
                      )
                )
                e.stopPropagation()
                e.preventDefault()
              }}
            />
            <Button
              size={ComponentSize.ExtraSmall}
              color={ComponentColor.Primary}
              onClick={() => {
                try {
                  const script = buildQuery(builderState)
                  onSubmit(script)
                } catch (ex) {
                  console.error(ex)
                  notify(
                    fluxWizardError(
                      'Unable to build flux script: ' + ex.message
                    )
                  )
                }
              }}
              status={
                isRunnable ? ComponentStatus.Default : ComponentStatus.Disabled
              }
              text="Submit"
            />
          </div>
        </AggregationSelector>
      </div>
    </div>
  )
}
const mstp = (state: any) => {
  const fluxQueryBuilder = state?.fluxQueryBuilder as QueryBuilderState
  return {
    builderState: fluxQueryBuilder,
    tags: fluxQueryBuilder.tags,
    isRunnable:
      fluxQueryBuilder.buckets.status === RemoteDataState.Done &&
      !!fluxQueryBuilder.buckets.selectedBucket,
  }
}
const mdtp = {
  onAddTagSelector: addTagSelectorThunk,
  notify: notifyActionCreator,
}

export default connect(mstp, mdtp)(FluxQueryBuilder)
