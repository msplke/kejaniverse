export default function Dashboard() {
  return (
    <main>
      <div className="px-8">
        <h1 className="text-2xl">Dashboard</h1>
        <div>
          <p>No properties at the moment</p>
          <button className="cursor-pointer rounded-lg bg-blue-200 px-4 py-2">
            Add property
          </button>
        </div>
      </div>
    </main>
  );
}
