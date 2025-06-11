import { z } from "zod";

export const expertiseEnum = z.enum([
  "KITCHEN",
  "WATCHINE_MATCHINE",
  "BELL",
  "AIR_CONDITIONING",
  "FRIDGE",
  "ELECTRIC_WATER_HEATER",
  "GAS_WATER_HEATER",
  "QUICKIE",
  "WASH_DRY",
  "CAR_WASH_CENTER",
]);
