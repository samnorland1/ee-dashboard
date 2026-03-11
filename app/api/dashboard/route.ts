import { NextResponse } from "next/server";
import { getAllDashboardData } from "@/lib/sheets";

export const revalidate = 300; // revalidate every 5 minutes

export async function GET() {
  try {
    const data = await getAllDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
