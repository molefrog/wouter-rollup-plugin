import React from "react";

type Params = {
  "*": string;
};

export default function About({ params }: { params: Params }) {
  return <>Page {params["*"]} not fofsdfn (404)</>;
}
