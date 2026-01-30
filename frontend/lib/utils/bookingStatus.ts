/** Light badge style (e.g. bg-green-100 text-green-800) */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'no_show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/** Solid background for calendar blocks (e.g. bg-green-500) */
export function getStatusColorBlock(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'completed':
      return 'bg-blue-500';
    case 'no_show':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'Bestätigt';
    case 'pending':
      return 'Ausstehend';
    case 'cancelled':
      return 'Storniert';
    case 'completed':
      return 'Abgeschlossen';
    case 'no_show':
      return 'Nicht erschienen';
    default:
      return status;
  }
}
