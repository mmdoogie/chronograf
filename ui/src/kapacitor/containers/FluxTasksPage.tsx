import React, {useEffect, useState} from 'react'
import {FluxTask, Kapacitor, Source} from 'src/types'
import KapacitorScopedPage from './KapacitorScopedPage'
import {useDispatch} from 'react-redux'
import {deleteFluxTask, getFluxTasks, updateFluxTaskStatus} from '../apis'
import errorMessage from '../utils/errorMessage'
import PageSpinner from 'src/shared/components/PageSpinner'
import FluxTasksTable from '../components/FluxTasksTable'
import {notify} from 'src/shared/actions/notifications'
import {
  notifyAlertRuleDeleted,
  notifyAlertRuleDeleteFailed,
  notifyFluxTaskStatusUpdated,
  notifyFluxTaskStatusUpdateFailed,
} from 'src/shared/copy/notifications'
import useDebounce from '../../utils/useDebounce'

const Contents = ({
  kapacitor,
  source,
}: {
  kapacitor: Kapacitor
  source: Source
}) => {
  const [loading, setLoading] = useState(true)
  const [nameFilter, setNameFilter] = useState('')
  const [reloadRequired, setReloadRequired] = useState(0)
  const [error, setError] = useState(undefined)
  const [list, setList] = useState<FluxTask[] | null>(null)
  const dispatch = useDispatch()
  const filter = useDebounce(nameFilter)
  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        let data = (await getFluxTasks(kapacitor)) as FluxTask[]
        if (data && filter) {
          data = data.filter(x => x.name.includes(filter))
        }
        setList(data)
      } catch (e) {
        if (e.status === 404) {
          setList(null)
        } else {
          console.error(e)
          setError(
            new Error(
              e?.data?.message
                ? e.data.message
                : `Cannot load flux task: ${errorMessage(e)}`
            )
          )
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [kapacitor, reloadRequired, filter])

  if (error) {
    return (
      <div className="panel panel-solid">
        <div className="panel-body">
          <p className="unexpected_error">{error.toString()}</p>
        </div>
      </div>
    )
  }
  if (list === null) {
    return (
      <div className="panel panel-solid">
        <div className="panel-body">
          <p className="unexpected_error">
            No flux tasks are available. Kapacitor 1.6+ is required with Flux
            tasks enabled.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="panel">
      <div className="panel-heading">
        <div className="search-widget" style={{flexGrow: 1}}>
          <input
            type="text"
            className="form-control input-sm"
            placeholder="Search name"
            value={nameFilter}
            onChange={e => {
              setNameFilter(e.target.value)
            }}
          />
          <span className="icon search" />
        </div>
      </div>
      <div className="panel-body">
        {loading ? (
          <PageSpinner />
        ) : (
          <FluxTasksTable
            kapacitorLink={`/sources/${source.id}/kapacitors/${kapacitor.id}`}
            tasks={list}
            onDelete={(task: FluxTask) => {
              deleteFluxTask(kapacitor, task)
                .then(() => {
                  setReloadRequired(reloadRequired + 1)
                  dispatch(notify(notifyAlertRuleDeleted(task.name)))
                })
                .catch(() => {
                  dispatch(notify(notifyAlertRuleDeleteFailed(task.name)))
                })
            }}
            onChangeTaskStatus={(task: FluxTask) => {
              const status = task.status === 'active' ? 'inactive' : 'active'
              updateFluxTaskStatus(kapacitor, task, status)
                .then(() => {
                  setList(
                    list.map(x => (x.id === task.id ? {...task, status} : x))
                  )
                  dispatch(
                    notify(notifyFluxTaskStatusUpdated(task.name, status))
                  )
                })
                .catch(() => {
                  dispatch(
                    notify(notifyFluxTaskStatusUpdateFailed(task.name, status))
                  )
                  return false
                })
            }}
          />
        )}
      </div>
    </div>
  )
}

const FluxTasksPage = ({source: src}: {source: Source}) => {
  return (
    <KapacitorScopedPage source={src} title="Flux Tasks">
      {(kapacitor: Kapacitor, source: Source) => (
        <Contents kapacitor={kapacitor} source={source} />
      )}
    </KapacitorScopedPage>
  )
}

export default FluxTasksPage
