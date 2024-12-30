"use server";
export default async function Project({ params }) {
  const projectId = await params;
  console.log(projectId);
  // const boards=
  return (
    <main>
      <div>{/* Boards */}</div>
    </main>
  );
}
