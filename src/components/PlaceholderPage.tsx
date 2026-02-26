const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <p className="text-lg font-semibold text-foreground">{title}</p>
    <p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
  </div>
);

export default PlaceholderPage;
