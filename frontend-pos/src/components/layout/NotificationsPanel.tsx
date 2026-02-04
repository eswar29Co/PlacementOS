import { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { markAsRead, markAllAsRead, removeNotification } from '@/store/slices/notificationsSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';

export function NotificationsPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAppSelector((state) => state.auth);

    // Fetch notifications using React Query
    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationService.getNotifications,
        enabled: !!user,
        refetchInterval: 30000,
    });

    const notifications = notificationsData?.data?.notifications || [];
    const unreadCount = notificationsData?.data?.unreadCount || 0;
    const userNotifications = notifications;

    const markReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: notificationService.deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleMarkAsRead = async (id: string, actionUrl?: string) => {
        markReadMutation.mutate(id);
        dispatch(markAsRead(id)); // Keep Redux in sync if needed
        if (actionUrl) {
            navigate(actionUrl);
            setIsOpen(false);
        }
    };

    const handleMarkAllAsRead = () => {
        markAllReadMutation.mutate();
        if (user?.id) {
            dispatch(markAllAsRead(user.id));
        }
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteMutation.mutate(id);
        dispatch(removeNotification(id));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'professional_approved':
            case 'resume_approved':
            case 'assessment_approved':
                return '✅';
            case 'professional_rejected':
            case 'resume_rejected':
            case 'assessment_rejected':
                return '❌';
            case 'assessment_released':
                return '📝';
            case 'interview_assigned':
            case 'interview_scheduled':
                return '📅';
            case 'interview_completed':
                return '✔️';
            case 'offer_released':
                return '🎉';
            case 'application_update':
                return '📢';
            case 'new_job_posted':
                return '🏢';
            case 'student_registered':
                return '🎓';
            case 'professional_signup':
                return '💼';
            case 'admin_note':
                return '📝';
            default:
                return '🔔';
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Notifications Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="absolute right-0 top-12 z-50 w-96 rounded-lg border bg-card shadow-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b p-4">
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                <h3 className="font-semibold">Notifications</h3>
                                {unreadCount > 0 && (
                                    <Badge variant="secondary">{unreadCount} new</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs"
                                    >
                                        <CheckCheck className="h-4 w-4 mr-1" />
                                        Mark all read
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <ScrollArea className="h-[400px]">
                            {userNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        We'll notify you when something happens
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {userNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                'p-4 transition-colors cursor-pointer hover:bg-muted/50',
                                                !notification.read && 'bg-primary/5'
                                            )}
                                            onClick={() => handleMarkAsRead(notification.id, notification.actionUrl)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className="text-2xl shrink-0 mt-0.5">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-medium text-sm">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                        </p>
                                                        <div className="flex items-center gap-1">
                                                            {!notification.read && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        dispatch(markAsRead(notification.id));
                                                                    }}
                                                                    className="h-6 px-2 text-xs"
                                                                >
                                                                    <Check className="h-3 w-3 mr-1" />
                                                                    Mark read
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => handleRemove(notification.id, e)}
                                                                className="h-6 w-6"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Footer */}
                        {userNotifications.length > 0 && (
                            <div className="border-t p-3 text-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => {
                                        navigate(user?.role === 'admin' ? '/admin/notifications' : `/${user?.role}/notifications`);
                                        setIsOpen(false);
                                    }}
                                >
                                    View all notifications
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
