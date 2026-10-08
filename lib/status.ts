export const REQUEST_STATUSES = ['CREATED','SEARCHING','ASSIGNED','MECHANIC_EN_ROUTE','ARRIVED','IN_PROGRESS','PAYMENT_PENDING','COMPLETED','CANCELLED'] as const
export function statusClass(status:string){
 if(status==='COMPLETED') return 'green';
 if(status==='CANCELLED') return 'red';
 if(status==='PAYMENT_PENDING') return 'amber';
 if(['ASSIGNED','MECHANIC_EN_ROUTE','ARRIVED','IN_PROGRESS'].includes(status)) return 'blue';
 return 'gray';
}
