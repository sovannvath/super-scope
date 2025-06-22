import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

const Orders: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-metallic-primary">Orders</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="mr-2 h-5 w-5 text-metallic-secondary" />
            Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-16 w-16 text-metallic-light mb-4" />
            <h3 className="text-lg font-semibold text-metallic-primary mb-2">
              Coming Soon
            </h3>
            <p className="text-metallic-tertiary">
              Order management interface will be implemented here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
