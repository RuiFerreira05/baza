import { ErrorTypes, groupDTO, type GroupDTO } from "@baza/shared-types";
import { Value } from "typebox/value";
import { db } from "../lib/db";
import { Err, Ok, type Result } from "../lib/types";

export const getGroupById = async (id: string): Promise<Result<GroupDTO, ErrorTypes>> => {
  const group = await db.query.groups.findFirst({
    where: {
      id: id,
    },
  });

  if (group) {
    const conv = Value.Convert(groupDTO, group);
    if (Value.Check(groupDTO, conv)) {
      return Ok(conv);
    } else {
      console.error(Value.Errors(groupDTO, conv)); 
      return Err(ErrorTypes.ConversionError);
    }
  } else {
    return Err(ErrorTypes.UnknownIdError);
  }
};
