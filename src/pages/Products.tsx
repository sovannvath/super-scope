import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

const Products: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-metallic-primary">Products</h1>
        <Button className="bg-metallic-primary hover:bg-metallic-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-metallic-secondary" />
            Product Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-metallic-light mb-4" />
            <h3 className="text-lg font-semibold text-metallic-primary mb-2">
              Coming Soon
            </h3>
            <p className="text-metallic-tertiary">
              Product management interface will be implemented here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
