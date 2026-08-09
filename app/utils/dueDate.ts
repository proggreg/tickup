function utcDayStart(date: Date | string): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}

function todayUtc(): Date {
    return utcDayStart(new Date());
}

export function isTodoOverdue(dueDate: Date | string | null | undefined, status?: string): boolean {
    if (!dueDate || status === 'Closed') return false;
    return utcDayStart(dueDate) < todayUtc();
}

export function isTodoDueToday(dueDate: Date | string | null | undefined): boolean {
    if (!dueDate) return false;
    return utcDayStart(dueDate).getTime() === todayUtc().getTime();
}
