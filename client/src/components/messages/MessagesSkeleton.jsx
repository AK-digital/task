import styles from "@/styles/components/messages/messages-skeletons.module.css";

export default function MessagesSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, idx) => {
        return (
          <div className="w-full" key={idx}>
            <div className="py-4 px-6 bg-background-secondary-color rounded-lg w-full">
              {/* Message Head */}
              <div className="header_MessagesSkeleton">
                <div></div>
                <div></div>
              </div>
              {/* Message Body */}
              <div className="body_MessagesSkeleton">
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
