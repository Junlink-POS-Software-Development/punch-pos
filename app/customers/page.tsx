import React from "react";
import { fetchCustomerFeatureData } from "./api/services";
import CustomerFeatureLayout from "./CustomerFeatureLayout";

export default async function CustomerPage() {
  // 1. Fetch data on the server (Server Side Rendering)
  const data = await fetchCustomerFeatureData();

  // 2. Pass data to Client Component for React Query hydration
  return <CustomerFeatureLayout initialData={data} />;
}