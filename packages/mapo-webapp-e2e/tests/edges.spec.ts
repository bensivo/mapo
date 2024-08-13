import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:4200/';

test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByTestId('start-mapping-btn').click();
    expect(page.url()).toContain('/canvas');
});

test('add edge - standard', async ({ page }) => {
    // Given: there are 2 nodes;
    await page.evaluate(() => {
        (window as any).mapo.addTextNode('Node A', 200, 200);
        (window as any).mapo.addTextNode('Node B', 200, 400);
    })

    // When: I click on edge, click on node A, drag to node B, and click on node B
    await page.getByTestId('toolbar-edge').click();
    await page.mouse.click(200,200);
    await page.mouse.move(400,200, {steps: 20});
    await page.mouse.click(400,200);
    await page.waitForTimeout(100);

    // Then there are 3 objects on the canvas
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects.length).toBe(3);

    const nodes = objects.filter(o => o.data?.type === 'text-node');
    expect(nodes.length).toBe(2);

    const edges = objects.filter(o => o.data?.type === 'edge');
    expect(edges.length).toBe(1);
});

test('add edge - e', async ({ page }) => {
    // Given: there are 2 nodes;
    await page.evaluate(() => {
        (window as any).mapo.addTextNode('Node A', 200, 200);
        (window as any).mapo.addTextNode('Node B', 200, 400);
    })

    // When: I click on edge, click on node A, drag to node B, and click on node B
    await page.keyboard.press('e');
    await page.mouse.click(200,200);
    await page.mouse.move(400,200, {steps: 20});
    await page.mouse.click(400,200);
    await page.waitForTimeout(100);

    // Then there are 3 objects on the canvas
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects.length).toBe(3);

    const nodes = objects.filter(o => o.data?.type === 'text-node');
    expect(nodes.length).toBe(2);

    const edges = objects.filter(o => o.data?.type === 'edge');
    expect(edges.length).toBe(1);
});

test('cancel edge - click on nothing', async ({ page }) => {
    // Given: there is a node
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 200, 200);
    })
    await page.waitForTimeout(100);


    // When: I click and drag, but then click on something that's not a node
    await page.getByTestId('toolbar-edge').click();
    await page.mouse.click(200,200);
    await page.mouse.move(400,200, {steps: 20});
    await page.mouse.click(400,200);
    await page.waitForTimeout(100);

    // Then no edge is drawn
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects.length).toBe(1);
});

test('cancel edge - Escape', async ({ page }) => {
    // Given: there is a node
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 200, 200);
    })
    await page.waitForTimeout(100);


    // When: I click and drag, but then press Escape
    await page.getByTestId('toolbar-edge').click();
    await page.mouse.click(200,200);
    await page.mouse.move(400,200, {steps: 20});
    await page.waitForTimeout(100);

    await page.keyboard.press('Escape');

    // Then no edge is drawn
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects.length).toBe(1);
});
