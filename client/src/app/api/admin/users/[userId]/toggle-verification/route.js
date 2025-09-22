"use server";
import { useAuthFetch } from "@/utils/api";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { userId } = params;
    const body = await request.json();
    
    const res = await useAuthFetch(
      `user/admin/${userId}/toggle-verification`, 
      "PATCH", 
      "application/json",
      body
    );
    
    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || "Erreur lors de la modification du statut" 
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur dans l'API route toggle-verification:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Une erreur inattendue est survenue" 
      },
      { status: 500 }
    );
  }
}
