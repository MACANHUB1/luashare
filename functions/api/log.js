export async function onRequestPost(context) {
    try {
        const { request } = context;
        const browserData = await request.json();

        const ip = request.headers.get('cf-connecting-ip') || 'unknown';
        const country = request.headers.get('cf-ipcountry') || 'unknown';
        const asn = request.cf?.asn || 'unknown';
        const isp = request.cf?.asOrganization || 'unknown';

        const discordPayload = {
            embeds: [
                {
                    title: "🌐 Новый посетитель LuaShare",
                    color: 15158332,
                    fields: [
                        {
                            name: "Сетевые данные",
                            value: `**IP:** ${ip}\n**Страна:** ${country}\n**Провайдер:** ${isp} (ASN: ${asn})`,
                            inline: false
                        },
                        {
                            name: "Устройство и Браузер",
                            value: `**Разрешение:** ${browserData.screenResolution}\n**Ядра ЦП:** ${browserData.cores}\n**ОЗУ (примерно):** ${browserData.deviceMemory} GB\n**Язык:** ${browserData.language}\n**Временная зона:** ${browserData.timezone}`,
                            inline: false
                        },
                        {
                            name: "User-Agent",
                            value: `\`\`\`${browserData.userAgent}\`\`\``,
                            inline: false
                        }
                    ],
                    timestamp: new Date().toISOString()
                }
            ]
        };

        await fetch("https://discord.com/api/webhooks/1512101673215201382/DELFHRqqcOmngGJs3WUUtxSjnXJvuqLAZprACsf6OlvuT573L2c-uhNJbUHIc67NP0Wq", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(discordPayload)
        });

        return new Response(JSON.stringify({ status: "ok" }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(null, { status: 200 });
    }
}
