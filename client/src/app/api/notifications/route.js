import { getNotifications } from '@/api/notification';

export async function GET() {
  try {
    const result = await getNotifications();
    return Response.json(result);
  } catch (error) {
    console.error('Error in notifications API route:', error);
    return Response.json(
      { success: false, message: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
