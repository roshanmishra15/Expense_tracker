import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Users() {
	const { token, user } = useAuth();

	const { data, isLoading, isError } = useQuery({
		queryKey: ['/api/admin/users'],
		queryFn: async () => {
			const res = await fetch('/api/admin/users', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) {
				throw new Error('Failed to load users');
			}
			return res.json();
		},
		enabled: !!token && user?.role === 'admin',
	});

	return (
		<MainLayout title="Users">
			<Card>
				<CardHeader>
					<CardTitle>Users</CardTitle>
				</CardHeader>
				<CardContent>
					{user?.role !== 'admin' ? (
						<Alert>
							<AlertDescription>Only admins can view users.</AlertDescription>
						</Alert>
					) : isLoading ? (
						<p className="text-muted-foreground">Loading…</p>
					) : isError ? (
						<Alert>
							<AlertDescription>Failed to load users.</AlertDescription>
						</Alert>
					) : Array.isArray(data) ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.map((u: any) => (
									<TableRow key={u.id}>
										<TableCell>{u.name}</TableCell>
										<TableCell>{u.email}</TableCell>
										<TableCell>{u.role}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					) : (
						<p className="text-muted-foreground">{data?.message || 'No users found.'}</p>
					)}
				</CardContent>
			</Card>
		</MainLayout>
	);
}


