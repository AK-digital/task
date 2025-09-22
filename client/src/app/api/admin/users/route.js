"use server";
import { useAuthFetch } from "@/utils/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await useAuthFetch("user/admin/all", "GET", "application/json");
    
    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Erreur lors de la récupération des utilisateurs" 
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur dans l'API route admin/users:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Une erreur inattendue est survenue" 
      },
      { status: 500 }
    );
  }
}
