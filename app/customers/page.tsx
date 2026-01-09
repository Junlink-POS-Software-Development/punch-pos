import React from "react";
import { fetchCustomerFeatureData } from "./api/services";
import CustomerFeatureLayout from "./CustomerFeatureLayout";

export default async function CustomerPage() {
  // 1. Fetch data on the server (Server Side Rendering)
  const data = await fetchCustomerFeatureData();

  // 2. Pass data to Client Component to hydrate SWR
  return <CustomerFeatureLayout initialData={data} />;
}