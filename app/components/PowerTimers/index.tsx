"use client"

import "./index.css"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, useFieldArray, FieldErrors } from "react-hook-form"
import { PowerTimer, DAYS, MAX_TIMERS, fetchPowerTimers, savePowerTimers } from "@/app/api/common"

type FormData = { timers: PowerTimer[] }
type FormError = Record<string, { type: "client" | "server"; message: string }> | undefined

const defaultTimerRow = {
  timerNumber: 1,
  enabled: true,
  powerOffTime: "22:00",
  powerOnTime: "07:00",
  daysOfWeek: ["MONDAY"],
}

export default function PowerTimers() {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ["timers"],
    queryFn: fetchPowerTimers,
  })

  const mutation = useMutation({
    mutationFn: savePowerTimers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timers"] })
    },
  })

  async function customResolver(values: FormData) {
    let errors: { timers?: Array<FormError> } = { timers: [] }
    let hasError = false
    values.timers.forEach((timer, i) => {
      if (timer.enabled) {
        const timerErrors: FormError = {}
        if (!timer.powerOffTime) {
          timerErrors.powerOffTime = { type: "client", message: "Power Off time is required." }
        }
        if (!timer.powerOnTime) {
          timerErrors.powerOnTime = { type: "client", message: "Power On time is required." }
        }
        const selectedDays = (timer.daysOfWeek || []).filter(Boolean)
        if (selectedDays.length === 0) {
          timerErrors.daysOfWeek = {
            type: "client",
            message: "At least one day must be selected.",
          }
        }
        if (Object.keys(timerErrors).length > 0) {
          errors.timers![i] = timerErrors
          hasError = true
        } else {
          errors.timers![i] = undefined
        }
      } else {
        errors.timers![i] = undefined
      }
    })
    if (!hasError) {
      errors = {}
    }
    return { values, errors }
  }

  const {
    control,
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      timers: data || [defaultTimerRow],
    },
    resolver: customResolver,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const { fields, append } = useFieldArray({ control, name: "timers" })
  const watchedTimers = watch("timers")

  function onSubmit(data: FormData) {
    console.log("Submitting data", data)
    mutation.mutate(data.timers)
  }

  function onFormErrors(formErrors: FieldErrors<FormData>) {
    console.log("Form errors:", formErrors)
  }

  function toggleAllDays(isChecked: boolean) {
    return {
      daysOfWeek: isChecked ? DAYS.map((d) => d.toUpperCase()) : [],
    }
  }

  function getSelectedDays(day: string, isChecked: boolean, currentDays: string[]) {
    return {
      daysOfWeek: isChecked ? [...currentDays, day.toUpperCase()] : currentDays.filter((d) => d !== day.toUpperCase()),
    }
  }

  function addTimer() {
    append({
      ...defaultTimerRow,
      timerNumber: fields.length + 1,
    })
  }

  return (
    <section className="power-timers">
      <form onSubmit={handleSubmit(onSubmit, onFormErrors)} onChange={() => trigger()}>
        <div className="power-timers__table">
          {/* --------------- Table Headers ---------------*/}
          <div className="power-timers__header">
            <span>Enabled?</span>
            <span>Power Off</span>
            <span>Power On</span>
            <span className="align-center">All Days?</span>
            <span className="align-center day-monday">Mon</span>
            <span className="align-center day-tuesday">Tues</span>
            <span className="align-center day-wednesday">Wed</span>
            <span className="align-center day-thursday">Thur</span>
            <span className="align-center day-friday">Fri</span>
            <span className="align-center day-saturday">Sat</span>
            <span className="align-center day-sunday">Sun</span>
          </div>

          {/* ---------------Table Rows ---------------*/}
          {fields.map((field, i) => {
            const timer = watchedTimers[i]
            const hasError = Object.keys(errors?.timers?.[i] || {}).length ? "power-timers__row--error" : ""
            const hasDaysError = errors?.timers?.[i]?.daysOfWeek ? "power-timers__row--days-error" : ""
            const rowError = Object.values((errors?.timers?.[i] as FormError) || {})
              .map((error) => ` • ${error?.message} `)
              .join(" ")
            return (
              <div key={field.id} className="power-timers__row-wrap">
                <div className={`power-timers__row ${timer?.enabled ? "" : "disabled"} ${hasError} ${hasDaysError}`}>
                  <label className="switch">
                    <input type="checkbox" {...register(`timers.${i}.enabled`)} />
                    <span className="slider"></span>
                    <span className="sr-only">Enabled</span>
                  </label>

                  <label>
                    <input
                      type="time"
                      disabled={!timer?.enabled}
                      {...register(`timers.${i}.powerOffTime`)}
                      className={errors?.timers?.[i]?.powerOffTime ? "error" : ""}
                    />
                    <span className="sr-only">Power On</span>
                  </label>

                  <label>
                    <input
                      type="time"
                      disabled={!timer?.enabled}
                      {...register(`timers.${i}.powerOnTime`)}
                      className={errors?.timers?.[i]?.powerOnTime ? "error" : ""}
                    />
                    <span className="sr-only">Power On</span>
                  </label>

                  <label className="checkbox checkbox--no-label align-center">
                    <span>All Days?</span>
                    <input
                      type="checkbox"
                      title="All Days"
                      disabled={!timer?.enabled}
                      checked={
                        timer?.daysOfWeek?.length === DAYS.length && DAYS.every((day) => timer.daysOfWeek.includes(day.toUpperCase()))
                      }
                      onChange={(e) => {
                        const updates = toggleAllDays(e.target.checked)
                        setValue(`timers.${i}.daysOfWeek`, updates.daysOfWeek)
                      }}
                    />
                  </label>

                  {DAYS.map((day) => (
                    <label key={day} className="checkbox checkbox--no-label align-center checkbox--day">
                      <input
                        type="checkbox"
                        name={day}
                        title={day}
                        disabled={!timer?.enabled}
                        checked={timer?.daysOfWeek?.includes(day.toUpperCase()) || false}
                        onChange={(e) => {
                          const updates = getSelectedDays(day, e.target.checked, timer?.daysOfWeek || [])
                          setValue(`timers.${i}.daysOfWeek`, updates.daysOfWeek)
                        }}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>

                <div className="power-timers__row-message">
                  {rowError && (
                    <>
                      <img src="/Info.svg" alt="" />
                      <span>Error: {rowError}</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          {/* ---------------Add Timer ---------------*/}
          {fields.length < MAX_TIMERS && (
            <div className="power-timers__new-row">
              <div className="message">You can add {MAX_TIMERS - fields.length} more Timers</div>

              <button type="button" className="button-secondary" onClick={addTimer}>
                <img src="/Plus.svg" alt="" />
                Add A Timer
              </button>
            </div>
          )}

          {mutation.isPending && (
            <div className="loading">
              <img src="/schedules.svg" alt="" width="300" />
              <br />
              <h2>Saving the Power Timers!</h2>
              <p>Please wait, it could take upto 30 seconds</p>
              <div className="progress-bar">
                <span className="progress"></span>
              </div>
            </div>
          )}
        </div>

        {/* ---------------Form Actions ---------------*/}
        <div className="power-timers__actions">
          <div className="power-timers__messages">{mutation.isSuccess && <p>Power Timers Saved!</p>}</div>
          <button type="submit" className="button-primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Timers"}
          </button>
        </div>
      </form>
    </section>
  )
}
