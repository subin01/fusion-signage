"use client"

import "./index.css"
import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, useFieldArray, FieldErrors } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion"
import {
  PowerTimer,
  FormData,
  FormError,
  validator,
  DAYS,
  MAX_TIMERS,
  fetchPowerTimers,
  savePowerTimers,
} from "@/app/components/PowerTimers/utils"

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

  const {
    control,
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      timers: data || [defaultTimerRow],
    },
    resolver: validator,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  useEffect(() => {
    reset({ timers: data })
  }, [data, reset])

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
                      aria-invalid={!!errors?.timers?.[i]?.powerOffTime}
                      aria-describedby={errors?.timers?.[i]?.powerOffTime ? `powerOffTime-error-${i}` : undefined}
                    />
                    <span className="sr-only">Power Off</span>
                  </label>

                  <label>
                    <input
                      type="time"
                      disabled={!timer?.enabled}
                      {...register(`timers.${i}.powerOnTime`)}
                      className={errors?.timers?.[i]?.powerOnTime ? "error" : ""}
                      aria-invalid={!!errors?.timers?.[i]?.powerOnTime}
                      aria-describedby={errors?.timers?.[i]?.powerOnTime ? `powerOnTime-error-${i}` : undefined}
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
                      aria-invalid={!!errors?.timers?.[i]?.daysOfWeek}
                      aria-describedby={errors?.timers?.[i]?.daysOfWeek ? `daysOfWeek-error-${i}` : undefined}
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

                {hasError && (
                  <div className="power-timers__row-message" aria-live="assertive">
                    <img src="/Info.svg" alt="" /> Error:
                    {errors?.timers?.[i]?.powerOffTime && (
                      <span id={`powerOffTime-error-${i}`}>&bull; {errors.timers[i].powerOffTime.message}</span>
                    )}
                    {errors?.timers?.[i]?.powerOnTime && (
                      <span id={`powerOnTime-error-${i}`}>&bull; {errors.timers[i].powerOnTime.message}</span>
                    )}
                    {errors?.timers?.[i]?.daysOfWeek && (
                      <span id={`daysOfWeek-error-${i}`}>&bull; {errors.timers[i].daysOfWeek.message}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* ---------------Add Timer ---------------*/}
          {fields.length < MAX_TIMERS && (
            <div className="power-timers__new-row">
              <div className="message">You can add {MAX_TIMERS - fields.length} more Timers</div>

              <button type="button" className="button-secondary" onClick={addTimer} data-testid="add-timer-button">
                <img src="/Plus.svg" alt="" />
                Add A Timer
              </button>
            </div>
          )}

          {mutation.isPending && (
            <div className="loading" aria-live="polite" data-testid="loading">
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
          <button type="submit" className="button-primary" disabled={mutation.isPending} data-testid="submit-button">
            {mutation.isPending ? "Saving..." : "Save Timers"}
          </button>
        </div>
      </form>
    </section>
  )
}
