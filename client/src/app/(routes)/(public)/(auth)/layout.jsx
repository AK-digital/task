export default function AuthLayout({ children }) {
  return (
    <main className="flex flex-col items-center h-[100svh] mx-5 text-text-lighter-color">
      {children}
      <span className="relative bottom-[9%] left-[340px] text-[2rem] text-text-darker-color">
        Simple as <strong>täsk</strong>
      </span>
    </main>
  );
}
