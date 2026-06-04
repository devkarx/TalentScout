export default function SkeletonCard() {
  return (
    <div className="surface p-6 h-[320px] flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 skeleton" />
          <div className="h-3 w-1/2 skeleton" />
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-5/6 skeleton" />
        <div className="h-3 w-4/6 skeleton" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 skeleton" />
        <div className="h-6 w-20 skeleton" />
        <div className="h-6 w-14 skeleton" />
      </div>
      <div className="border-t border-border-subtle pt-3 mt-auto">
        <div className="h-3 w-2/3 skeleton" />
      </div>
    </div>
  );
}
