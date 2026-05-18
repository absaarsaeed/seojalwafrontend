export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="admin-card overflow-hidden">
    <table className="w-full admin-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i}>
              <div className="h-3 w-20 bg-[#F0F0F0] rounded skeleton-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex}>
                <div 
                  className="h-4 bg-[#F0F0F0] rounded skeleton-pulse" 
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const CardSkeleton = () => (
  <div className="admin-card p-5">
    <div className="h-4 w-24 bg-[#F0F0F0] rounded skeleton-pulse mb-3" />
    <div className="h-8 w-32 bg-[#F0F0F0] rounded skeleton-pulse mb-4" />
    <div className="space-y-2">
      <div className="h-3 w-full bg-[#F0F0F0] rounded skeleton-pulse" />
      <div className="h-3 w-3/4 bg-[#F0F0F0] rounded skeleton-pulse" />
    </div>
  </div>
);

export const ChartSkeleton = ({ height = 300 }) => (
  <div className="admin-card p-5">
    <div className="h-4 w-32 bg-[#F0F0F0] rounded skeleton-pulse mb-4" />
    <div 
      className="w-full bg-[#F0F0F0] rounded skeleton-pulse" 
      style={{ height }}
    />
  </div>
);

export const FormSkeleton = ({ fields = 4 }) => (
  <div className="admin-card p-6 space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <div className="h-3 w-20 bg-[#F0F0F0] rounded skeleton-pulse mb-2" />
        <div className="h-10 w-full bg-[#F0F0F0] rounded skeleton-pulse" />
      </div>
    ))}
    <div className="h-10 w-24 bg-[#F0F0F0] rounded skeleton-pulse mt-4" />
  </div>
);
