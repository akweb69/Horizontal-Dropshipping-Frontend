import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const CircleStatCard = ({ title, value, percentage, description, primaryColor, secondaryColor, icon }) => {
  const data = [
    { name: 'Completed', value: percentage, color: primaryColor },
    { name: 'Remaining', value: 100 - percentage, color: secondaryColor },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center pt-4">
        <div className="relative h-32 w-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="80%"
                outerRadius="100%"
                startAngle={90}
                endAngle={450}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
            <span className="text-xl font-bold text-gray-800 leading-tight break-words">{value}</span>
            <p className="text-xs text-muted-foreground mt-1 leading-snug break-words">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CircleStatCard;