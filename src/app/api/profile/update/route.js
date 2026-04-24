import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(req) {
  try {
    const formData = await req.formData();

    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const file = formData.get("file");

    // ✅ Validation
    if (!firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          message: "First name and last name are required",
        },
        { status: 400 },
      );
    }

    // ✅ Auth (cookie → token)
    const accessToken = req.cookies.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // ✅ Prepare form data for backend
    const backendFormData = new FormData();
    backendFormData.append("firstName", firstName);
    backendFormData.append("lastName", lastName);

    if (file && typeof file !== "string") {
      backendFormData.append("file", file);
    }

    // ✅ Backend URL
    const BASE_URL = process.env.API_BASE_URL;

    if (!BASE_URL) {
      throw new Error("API_BASE_URL not defined");
    }

    // ✅ Call backend (NOT Next API)
    const response = await fetch(`${BASE_URL}/profile/update`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: backendFormData,
    });

    // ✅ Safe response parsing
    let data = null;
    const text = await response.text();

    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      console.error("Invalid JSON response from backend:", text);
    }

    // ✅ Handle failure
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Update failed",
        },
        { status: response.status },
      );
    }

    // ✅ Success response
    return NextResponse.json({
      success: true,
      user: data?.user || null,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
