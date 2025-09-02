import { validator, FormData } from "./utils"

describe("validator", () => {
  it("returns errors for missing fields", async () => {
    const data: FormData = {
      timers: [
        {
          timerNumber: 1,
          enabled: true,
          powerOffTime: "",
          powerOnTime: "",
          daysOfWeek: [],
        },
      ],
    }
    const result = await validator(data)
    expect(result.errors.timers?.[0]?.powerOffTime?.message).toBeDefined()
    expect(result.errors.timers?.[0]?.powerOnTime?.message).toBeDefined()
    expect(result.errors.timers?.[0]?.daysOfWeek?.message).toBeDefined()
  })

  it("returns no errors for valid timer", async () => {
    const data: FormData = {
      timers: [
        {
          timerNumber: 1,
          enabled: true,
          powerOffTime: "22:00",
          powerOnTime: "07:00",
          daysOfWeek: ["MONDAY"],
        },
      ],
    }
    const result = await validator(data)
    expect(result.errors).toEqual({})
  })
})
