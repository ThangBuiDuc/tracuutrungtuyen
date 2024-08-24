import jwt from "jsonwebtoken";
import moment from "moment";

export async function POST(request) {
  const { cccd } = await request.json();
  //   console.log(process.env.HASURA_SECRET_KEY);
  //   console.log(await request.json());
  const token = jwt.sign(
    { cccd, exp: moment().unix() + 60 },
    process.env.HASURA_SECRET_KEY,
    {
      algorithm: "HS256",
    }
  );

  //   console.log(token);
  return Response.json({ token });
}
