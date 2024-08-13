import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:4200/';

test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByTestId('start-mapping-btn').click();
    expect(page.url()).toContain('/canvas');
});

test('add node - standard', async ({ page }) => {
    // Select text node
    await page.getByTestId('toolbar-text-node').click();
    await page.waitForTimeout(100);

    // Click
    await page.mouse.click(500,500);
    await page.waitForTimeout(100);

    // Type
    await page.keyboard.type('Hello, world');
    await page.waitForTimeout(100);

    // Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Then there is a text node on the canvas
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects[0]._objects[1].text).toBe('Hello, world');
});

test('add node - doubleclick', async ({ page }) => {
    // Double Click on empty space
    await page.mouse.dblclick(500,500);
    await page.waitForTimeout(100);

    // Type
    await page.keyboard.type('Hello, world');
    await page.waitForTimeout(100);

    // Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Then there is a text node on the canvas
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects[0]._objects[1].text).toBe('Hello, world');
});

test('add node - click off', async ({ page }) => {
    // Select text node
    await page.getByTestId('toolbar-text-node').click();
    await page.waitForTimeout(100);

    // Click
    await page.mouse.click(500,500);
    await page.waitForTimeout(100);

    // Type
    await page.keyboard.type('Hello, world');
    await page.waitForTimeout(100);

    // Click off node
    await page.mouse.click(100,100);
    await page.waitForTimeout(100);

    // Then there is a text node on the canvas
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects[0]._objects[1].text).toBe('Hello, world');
});

test('add node - debug', async ({ page }) => {
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 500, 500);
    })
    await page.waitForTimeout(100);

    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects[0]._objects[1].text).toBe('Hello, world');
});

test('edit node', async ({ page }) => {
    // Given: there is a node
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 500, 500);
    })
    await page.waitForTimeout(100);


    // When I double click it
    await page.mouse.dblclick(500,500);
    await page.waitForTimeout(100);

    // When I delete the word 'world' and replace it with 'World!'
    for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Backspace');
    }
    await page.waitForTimeout(100);
    await page.keyboard.type('World!');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Then the text is updated
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects[0]._objects[1].text).toBe('Hello, World!');
});

test('delete node - backspace', async ({ page }) => {
    // Given: there is a node
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 500, 500);
    })
    await page.waitForTimeout(100);


    // When I click on it, and press backspace
    await page.mouse.click(500,500);
    await page.waitForTimeout(100);

    await page.keyboard.press('Backspace');
    await page.waitForTimeout(100);

    // Then it gets deleted
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects.length).toBe(0);
});

test('delete node - d', async ({ page }) => {
    // Given: there is a node
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 500, 500);
    })
    await page.waitForTimeout(100);

    // When I click on it, and press Delete
    await page.mouse.click(500,500);
    await page.keyboard.press('d');
    await page.waitForTimeout(100);

    // Then it gets deleted
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects.length).toBe(0);
});

test('delete node - delete', async ({ page }) => {
    // Given: there is a node
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 500, 500);
    })
    await page.waitForTimeout(100);

    // When I click on it, and press Delete
    await page.mouse.click(500,500);
    await page.keyboard.press('Delete');
    await page.waitForTimeout(100);

    // Then it gets deleted
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects.length).toBe(0);
});

test('delete node - empty', async ({ page }) => {
    // Given: there is a node
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 500, 500);
    })
    await page.waitForTimeout(100);


    // When I edit its text, and remove all of it, then deselect the node
    await page.mouse.dblclick(500,500);
    await page.waitForTimeout(100);

    for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Backspace');
    }
    await page.waitForTimeout(100);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    // Then it gets deleted
    const objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    expect(objects.length).toBe(0);
});

test('drag node', async ({ page }) => {
    // Given: there is a node
    await page.evaluate(() => {
        return (window as any).mapo.addTextNode('Hello, world', 500, 500);
    })
    await page.waitForTimeout(100);

    // Store original position
    let objects: any[] = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });
    const originalTop = objects[0].top;
    const originalLeft = objects[0].left;

    // When: I click, drag right, and release
    await page.mouse.move(500,500);
    await page.mouse.down();
    await page.mouse.move(700,500, {steps: 20});
    await page.mouse.up();


    // Then: it is moved to the right
    objects = await page.evaluate(() => {
        return (window as any).mapo.getCanvas().getObjects();
    });

    expect(objects[0].top).toBe(originalTop);
    expect(objects[0].left).toBeGreaterThan(originalLeft);
});
