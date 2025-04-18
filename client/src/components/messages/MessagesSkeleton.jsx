export default function MessagesSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div key={i}></div>
      ))}
    </>
  );
}
