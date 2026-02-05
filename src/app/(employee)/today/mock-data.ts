export type JobStatus = 'pending' | 'checked_in' | 'working' | 'completed' | 'delivered';

export const mockJobs = [
    {
        id: '1',
        carModel: 'Toyota Corolla',
        plate: '12345-116-16',
        services: ['غسيل كامل', 'تلميع'],
        status: 'working' as JobStatus,
        time: '10:00',
        color: 'red',
    },
    {
        id: '2',
        carModel: 'BMW X5',
        plate: '00321-118-16',
        services: ['غسيل خارجي'],
        status: 'checked_in' as JobStatus,
        time: '11:30',
        color: 'black',
    },
    {
        id: '3',
        carModel: 'Hyundai Accent',
        plate: '55421-120-16',
        services: ['سيراميك'],
        status: 'completed' as JobStatus,
        time: '09:00',
        color: 'white',
    },
    {
        id: '4',
        carModel: 'Mercedes C-Class',
        plate: '99887-119-16',
        services: ['غسيل داخلي'],
        status: 'pending' as JobStatus,
        time: '14:00',
        color: 'silver',
    },
];
