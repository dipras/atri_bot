/* eslint-disable indent */
const vn_search = require('../services/vn_search');
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = async (interaction, client, msg = null) => {
    const infoToolCollect = interaction.channel.createMessageComponentCollector({
        time: 60000,
    });

    infoToolCollect.on('collect', async (i) => {
        try {
            if (i.user.id === interaction.user.id) {
                await i.deferUpdate();
                if (i.customId.includes('vn-dl-request')) {
                    infoToolCollect.resetTimer();
                    const id = parseInt(i.customId.split('-')[3]);
                    const title = i.message.embeds[0].data.title;
                    console.log('masuk');
                    await vn_search.request(id, title, client)
                        .then(async () => {
                            console.log('jalan');
                            await infoToolCollect.stop('Your request has been sent.');
                        });
                }
                else if (i.customId.includes('vn-dl-report')) {
                    infoToolCollect.resetTimer();
                    console.log('report');
                    const reportModal = new ModalBuilder()
                        .setCustomId('vnDeadLinkReportModal')
                        .setTitle('Report Dead Link')
                        .addComponents([
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('report-link-title')
                                    .setLabel('Link Name')
                                    .setStyle(TextInputStyle.Short)
                                    .setPlaceholder('Ex : [JP] Drive 1')
                                    .setRequired(true),
                            ),
                            new ActionRowBuilder().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('dead-link-reason')
                                    .setLabel('Reason')
                                    .setStyle(TextInputStyle.Paragraph)
                                    .setMaxLength(200)
                                    .setPlaceholder('Please enter the reason for reporting')
                                    .setRequired(true),
                            ),
                    ]);
                    await interaction.showModal(reportModal);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    });

    infoToolCollect.on('end', async (collect, message) => {
        if (msg != null) {
            await msg.edit({ content: message, embeds: [], components: [] });
        }
    });
};