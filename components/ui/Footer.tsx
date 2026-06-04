export default function Footer() {
  return (
    <footer className="w-full py-8 text-center text-text-subtle text-sm mt-auto border-t border-border-subtle bg-bg-main">
      <p className="flex items-center justify-center gap-1.5">
        &copy; {new Date().getFullYear()}
        <span className="font-display tracking-tight text-base ml-1">
          <span className="font-bold text-text-primary">Talent</span>
          <span className="font-light text-text-muted">Scout</span>
        </span>
        <span className="w-1.5 h-1.5 bg-accent rounded-sm inline-block" />
        <span className="ml-1">Built with intention.</span>
      </p>
    </footer>
  );
}
